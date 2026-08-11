import { db } from '../config/db';
import { StockMovement, StockMovementType } from '../types';
import { CustomAPIError } from '../middleware/errorHandler';

export class StockService {
  static async recordMovement(
    productId: number,
    quantityChanged: number,
    movementType: StockMovementType,
    reason: string,
    createdByUserId?: number,
    transactionConn?: any
  ): Promise<StockMovement> {
    const conn = transactionConn || (await db.getConnection());
    const isStandaloneConn = !transactionConn;

    try {
      if (isStandaloneConn) {
        await conn.beginTransaction();
      }

      // Lock product row exclusively using FOR UPDATE to prevent race conditions & double deductions
      const [rows]: any = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [productId]);
      if (!rows || rows.length === 0) {
        throw new CustomAPIError(`Product with ID ${productId} not found`, 404);
      }

      const product = rows[0];
      const currentStock = Number(product.current_stock);
      const qty = Number(quantityChanged);

      let newStock = currentStock;

      if (movementType === 'IN') {
        newStock = currentStock + qty;
      } else if (movementType === 'OUT') {
        if (currentStock < qty) {
          throw new CustomAPIError('Insufficient stock', 400, {
            product: product.name,
            sku: product.sku,
            availableStock: currentStock,
            requestedQuantity: qty,
          });
        }
        newStock = currentStock - qty;
      }

      // Update product stock level
      await conn.query('UPDATE products SET current_stock = ? WHERE id = ?', [newStock, productId]);

      // Insert stock movement audit log
      const movementSql = `
        INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [moveResult]: any = await conn.query(movementSql, [
        productId,
        qty,
        movementType,
        reason.trim(),
        createdByUserId || null,
      ]);

      if (isStandaloneConn) {
        await conn.commit();
      }

      const [fetched]: any = await db.query(
        `SELECT sm.*, p.name as product_name, p.sku as sku, u.name as created_by_name
         FROM stock_movements sm
         LEFT JOIN products p ON sm.product_id = p.id
         LEFT JOIN users u ON sm.created_by = u.id
         WHERE sm.id = ?`,
        [moveResult.insertId]
      );

      return fetched[0] as StockMovement;
    } catch (err) {
      if (isStandaloneConn) {
        await conn.rollback();
      }
      throw err;
    } finally {
      if (isStandaloneConn) {
        conn.release();
      }
    }
  }

  static async getMovements(params: {
    product_id?: number;
    movement_type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const queryParams: any[] = [];

    if (params.product_id) {
      conditions.push('sm.product_id = ?');
      queryParams.push(params.product_id);
    }

    if (params.movement_type && params.movement_type.trim()) {
      conditions.push('sm.movement_type = ?');
      queryParams.push(params.movement_type.trim().toUpperCase());
    }

    if (params.search && params.search.trim()) {
      const searchTerm = `%${params.search.trim()}%`;
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR sm.reason LIKE ? OR u.name LIKE ?)');
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      LEFT JOIN users u ON sm.created_by = u.id
      ${whereClause}
    `;
    const [countRows]: any = await db.query(countSql, queryParams);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT sm.*, p.name as product_name, p.sku as sku, u.name as created_by_name
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      LEFT JOIN users u ON sm.created_by = u.id
      ${whereClause}
      ORDER BY sm.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows]: any = await db.query(dataSql, [...queryParams, limit, offset]);

    return {
      movements: rows as StockMovement[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
