import { db } from '../config/db';
import { Product } from '../types';
import { CustomAPIError } from '../middleware/errorHandler';
import { StockService } from './stock.service';

export class ProductService {
  static async getAllProducts(params: {
    search?: string;
    category?: string;
    low_stock?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const queryParams: any[] = [];

    if (params.search && params.search.trim()) {
      const searchTerm = `%${params.search.trim()}%`;
      conditions.push('(name LIKE ? OR sku LIKE ? OR category LIKE ? OR location LIKE ?)');
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (params.category && params.category.trim()) {
      conditions.push('category = ?');
      queryParams.push(params.category.trim());
    }

    if (params.low_stock) {
      conditions.push('current_stock <= min_stock_alert');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const [countRows]: any = await db.query(countSql, queryParams);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT * FROM products
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows]: any = await db.query(dataSql, [...queryParams, limit, offset]);

    return {
      products: rows as Product[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getProductById(id: number): Promise<Product | null> {
    const [rows]: any = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return null;
    return rows[0] as Product;
  }

  static async getProductBySKU(sku: string): Promise<Product | null> {
    const [rows]: any = await db.query('SELECT * FROM products WHERE sku = ?', [sku.trim()]);
    if (!rows || rows.length === 0) return null;
    return rows[0] as Product;
  }

  static async createProduct(data: any, createdByUserId?: number): Promise<Product> {
    const skuFormatted = data.sku.trim().toUpperCase();
    const existing = await this.getProductBySKU(skuFormatted);
    if (existing) {
      throw new CustomAPIError(`Product with SKU '${skuFormatted}' already exists`, 409);
    }

    const initialStock = Math.max(0, parseInt(data.current_stock, 10) || 0);

    const sql = `
      INSERT INTO products
      (name, sku, category, unit_price, current_stock, min_stock_alert, location, status)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?)
    `;

    const params = [
      data.name.trim(),
      skuFormatted,
      data.category.trim(),
      Number(data.unit_price) || 0,
      Number(data.min_stock_alert) || 5,
      data.location ? data.location.trim() : 'Main Warehouse',
      data.status || 'ACTIVE',
    ];

    const [result]: any = await db.query(sql, params);
    const newProductId = result.insertId;

    // Automatically record an initial Stock IN movement if initial stock > 0
    if (initialStock > 0) {
      await StockService.recordMovement(
        newProductId,
        initialStock,
        'IN',
        'Initial Product Stock Creation',
        createdByUserId
      );
    }

    const created = await this.getProductById(newProductId);
    return created as Product;
  }

  static async updateProduct(id: number, data: any): Promise<Product | null> {
    const existing = await this.getProductById(id);
    if (!existing) return null;

    if (data.sku && data.sku.trim().toUpperCase() !== existing.sku) {
      const skuCheck = await this.getProductBySKU(data.sku);
      if (skuCheck && skuCheck.id !== id) {
        throw new CustomAPIError(`Product SKU '${data.sku}' is already assigned to another product`, 409);
      }
    }

    // Protection: Ignore direct current_stock edits. Stock modifications MUST use Stock Movements or Challans!
    const sql = `
      UPDATE products SET
        name = ?,
        sku = ?,
        category = ?,
        unit_price = ?,
        min_stock_alert = ?,
        location = ?,
        status = ?
      WHERE id = ?
    `;

    const params = [
      data.name ? data.name.trim() : existing.name,
      data.sku ? data.sku.trim().toUpperCase() : existing.sku,
      data.category ? data.category.trim() : existing.category,
      data.unit_price !== undefined ? Number(data.unit_price) : existing.unit_price,
      data.min_stock_alert !== undefined ? Number(data.min_stock_alert) : existing.min_stock_alert,
      data.location ? data.location.trim() : existing.location,
      data.status || existing.status,
      id,
    ];

    await db.query(sql, params);
    return this.getProductById(id);
  }
}
