import { db } from '../config/db';
import { Challan, ChallanItemSnapshot } from '../types';
import { StockService } from './stock.service';
import { ProductService } from './product.service';
import { CustomerService } from './customer.service';
import { CustomAPIError } from '../middleware/errorHandler';

export class ChallanService {
  private static async generateChallanNumber(): Promise<string> {
    const prefix = 'CH-';
    const [rows]: any = await db.query(
      "SELECT challan_number FROM challans WHERE challan_number LIKE 'CH-%' ORDER BY id DESC LIMIT 1"
    );

    let nextSeq = 1;
    if (rows && rows.length > 0) {
      const lastChallan = rows[0].challan_number; // e.g. CH-000005 or CHAL-2026-0001
      const numPart = lastChallan.replace(/[^0-9]/g, '');
      const lastNum = parseInt(numPart, 10);
      if (!isNaN(lastNum)) {
        nextSeq = lastNum + 1;
      }
    }

    const seqStr = String(nextSeq).padStart(6, '0');
    return `${prefix}${seqStr}`;
  }

  static async getAllChallans(params: {
    status?: string;
    customer_id?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const queryParams: any[] = [];

    if (params.status && params.status.trim()) {
      conditions.push('ch.status = ?');
      queryParams.push(params.status.trim().toUpperCase());
    }

    if (params.customer_id) {
      conditions.push('ch.customer_id = ?');
      queryParams.push(params.customer_id);
    }

    if (params.search && params.search.trim()) {
      const searchTerm = `%${params.search.trim()}%`;
      conditions.push('(ch.challan_number LIKE ? OR c.name LIKE ? OR c.business_name LIKE ? OR u.name LIKE ?)');
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total
      FROM challans ch
      LEFT JOIN customers c ON ch.customer_id = c.id
      LEFT JOIN users u ON ch.created_by = u.id
      ${whereClause}
    `;
    const [countRows]: any = await db.query(countSql, queryParams);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT ch.*, c.name as customer_name, c.business_name as customer_business_name, u.name as created_by_name
      FROM challans ch
      LEFT JOIN customers c ON ch.customer_id = c.id
      LEFT JOIN users u ON ch.created_by = u.id
      ${whereClause}
      ORDER BY ch.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows]: any = await db.query(dataSql, [...queryParams, limit, offset]);

    return {
      challans: rows as Challan[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getChallanById(id: number): Promise<Challan | null> {
    const sql = `
      SELECT ch.*, c.name as customer_name, c.business_name as customer_business_name,
             c.mobile as customer_mobile, c.email as customer_email, c.address as customer_address,
             c.gst_number as customer_gst, u.name as created_by_name
      FROM challans ch
      LEFT JOIN customers c ON ch.customer_id = c.id
      LEFT JOIN users u ON ch.created_by = u.id
      WHERE ch.id = ?
    `;
    const [rows]: any = await db.query(sql, [id]);
    if (!rows || rows.length === 0) return null;

    const challan: Challan = rows[0];

    const itemsSql = `SELECT * FROM challan_items WHERE challan_id = ? ORDER BY id ASC`;
    const [itemRows]: any = await db.query(itemsSql, [id]);

    challan.items = itemRows as ChallanItemSnapshot[];
    return challan;
  }

  static async createChallan(data: {
    customer_id: number;
    items: Array<{ product_id: number; quantity: number }>;
    status?: 'DRAFT' | 'CONFIRMED';
  }, createdByUserId?: number): Promise<Challan> {
    const customer = await CustomerService.getCustomerById(data.customer_id);
    if (!customer) {
      throw new CustomAPIError(`Customer with ID ${data.customer_id} not found`, 404);
    }

    const challanNumber = await this.generateChallanNumber();
    const initialStatus = data.status === 'CONFIRMED' ? 'CONFIRMED' : 'DRAFT';

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const itemSnapshots: Array<{
        product_id: number;
        product_name: string;
        sku: string;
        unit_price: number;
        quantity: number;
      }> = [];

      let totalQuantity = 0;
      let totalAmount = 0;

      for (const item of data.items) {
        // Lock product row exclusively using FOR UPDATE to protect against race conditions
        const [prodRows]: any = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
        if (!prodRows || prodRows.length === 0) {
          throw new CustomAPIError(`Product with ID ${item.product_id} not found`, 404);
        }

        const product = prodRows[0];
        const qty = Number(item.quantity);
        if (qty <= 0) {
          throw new CustomAPIError(`Quantity must be greater than 0 for product ${product.name}`, 400);
        }

        // If CONFIRMED status requested, check available stock immediately
        if (initialStatus === 'CONFIRMED' && Number(product.current_stock) < qty) {
          throw new CustomAPIError('Insufficient stock', 400, {
            product: product.name,
            sku: product.sku,
            availableStock: Number(product.current_stock),
            requestedQuantity: qty,
          });
        }

        const unitPrice = Number(product.unit_price) || 0;
        totalQuantity += qty;
        totalAmount += unitPrice * qty;

        itemSnapshots.push({
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          unit_price: unitPrice,
          quantity: qty,
        });
      }

      // Insert Challan Header
      const challanSql = `
        INSERT INTO challans (challan_number, customer_id, total_quantity, total_amount, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [chResult]: any = await conn.query(challanSql, [
        challanNumber,
        data.customer_id,
        totalQuantity,
        totalAmount,
        initialStatus,
        createdByUserId || null,
      ]);

      const challanId = chResult.insertId;

      // Insert Challan Product Snapshots
      const itemInsertSql = `
        INSERT INTO challan_items (challan_id, product_id, product_name, sku, unit_price, quantity)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      for (const snap of itemSnapshots) {
        await conn.query(itemInsertSql, [
          challanId,
          snap.product_id,
          snap.product_name,
          snap.sku,
          snap.unit_price,
          snap.quantity,
        ]);
      }

      // If CONFIRMED, execute stock reduction and record OUT stock movement
      if (initialStatus === 'CONFIRMED') {
        for (const snap of itemSnapshots) {
          await StockService.recordMovement(
            snap.product_id,
            snap.quantity,
            'OUT',
            `Sales Order #${challanNumber}`,
            createdByUserId,
            conn
          );
        }
      }

      await conn.commit();

      const createdChallan = await this.getChallanById(challanId);
      return createdChallan!;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async updateChallan(id: number, data: {
    customer_id?: number;
    items?: Array<{ product_id: number; quantity: number }>;
  }, userId?: number): Promise<Challan | null> {
    const existing = await this.getChallanById(id);
    if (!existing) return null;

    if (existing.status !== 'DRAFT') {
      throw new CustomAPIError(`Only DRAFT challans can be edited. Current status is ${existing.status}`, 400);
    }

    const customerId = data.customer_id || existing.customer_id;
    const items = data.items || existing.items;

    if (!items || items.length === 0) {
      throw new CustomAPIError('Challan must contain at least one product item', 400);
    }

    const itemSnapshots: Array<{
      product_id: number;
      product_name: string;
      sku: string;
      unit_price: number;
      quantity: number;
    }> = [];

    let totalQuantity = 0;
    let totalAmount = 0;

    for (const item of items) {
      const product = await ProductService.getProductById(item.product_id);
      if (!product) {
        throw new CustomAPIError(`Product with ID ${item.product_id} not found`, 404);
      }

      const qty = Number(item.quantity);
      if (qty <= 0) {
        throw new CustomAPIError(`Invalid quantity ${qty} for product ${product.name}`, 400);
      }

      const unitPrice = Number(product.unit_price) || 0;
      totalQuantity += qty;
      totalAmount += unitPrice * qty;

      itemSnapshots.push({
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        unit_price: unitPrice,
        quantity: qty,
      });
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        'UPDATE challans SET customer_id = ?, total_quantity = ?, total_amount = ? WHERE id = ?',
        [customerId, totalQuantity, totalAmount, id]
      );

      await conn.query('DELETE FROM challan_items WHERE challan_id = ?', [id]);

      const itemInsertSql = `
        INSERT INTO challan_items (challan_id, product_id, product_name, sku, unit_price, quantity)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      for (const snap of itemSnapshots) {
        await conn.query(itemInsertSql, [
          id,
          snap.product_id,
          snap.product_name,
          snap.sku,
          snap.unit_price,
          snap.quantity,
        ]);
      }

      await conn.commit();
      return this.getChallanById(id);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async confirmChallan(id: number, userId?: number): Promise<Challan> {
    const challan = await this.getChallanById(id);
    if (!challan) {
      throw new CustomAPIError(`Challan with ID ${id} not found`, 404);
    }

    if (challan.status === 'CONFIRMED') {
      throw new CustomAPIError(`Challan ${challan.challan_number} is already CONFIRMED`, 400);
    }

    if (challan.status === 'CANCELLED') {
      throw new CustomAPIError(`CANCELLED Challan ${challan.challan_number} cannot be confirmed`, 400);
    }

    if (!challan.items || challan.items.length === 0) {
      throw new CustomAPIError('Challan has no items', 400);
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Lock product rows exclusively using FOR UPDATE inside MySQL transaction
      for (const item of challan.items) {
        const [prodRows]: any = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
        if (!prodRows || prodRows.length === 0) {
          throw new CustomAPIError(`Product '${item.product_name}' (ID: ${item.product_id}) no longer exists`, 404);
        }

        const product = prodRows[0];
        const currentStock = Number(product.current_stock);
        const reqQty = Number(item.quantity);

        if (currentStock < reqQty) {
          throw new CustomAPIError('Insufficient stock', 400, {
            product: product.name,
            sku: product.sku,
            availableStock: currentStock,
            requestedQuantity: reqQty,
          });
        }
      }

      // Perform stock reduction and record OUT movements
      for (const item of challan.items) {
        await StockService.recordMovement(
          item.product_id,
          item.quantity,
          'OUT',
          `Sales Order #${challan.challan_number}`,
          userId,
          conn
        );
      }

      await conn.query('UPDATE challans SET status = "CONFIRMED" WHERE id = ?', [id]);
      await conn.commit();

      const updated = await this.getChallanById(id);
      return updated!;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async cancelChallan(id: number, userId?: number): Promise<Challan> {
    const challan = await this.getChallanById(id);
    if (!challan) {
      throw new CustomAPIError(`Challan with ID ${id} not found`, 404);
    }

    // Idempotent check: if already CANCELLED, do nothing to prevent restoring stock multiple times!
    if (challan.status === 'CANCELLED') {
      return challan;
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // If status was CONFIRMED, restore deducted stock with row-level locking (FOR UPDATE)
      if (challan.status === 'CONFIRMED' && challan.items) {
        for (const item of challan.items) {
          await StockService.recordMovement(
            item.product_id,
            item.quantity,
            'IN',
            `Cancelled Sales Order #${challan.challan_number}`,
            userId,
            conn
          );
        }
      }

      await conn.query('UPDATE challans SET status = "CANCELLED" WHERE id = ?', [id]);
      await conn.commit();

      const updated = await this.getChallanById(id);
      return updated!;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}
