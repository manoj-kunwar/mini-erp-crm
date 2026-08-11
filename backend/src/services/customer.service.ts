import { db } from '../config/db';
import { Customer, CustomerFollowup } from '../types';
import { CustomAPIError } from '../middleware/errorHandler';

export class CustomerService {
  static async getAllCustomers(params: {
    search?: string;
    status?: string;
    customer_type?: string;
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
      conditions.push('(c.name LIKE ? OR c.mobile LIKE ? OR c.email LIKE ? OR c.business_name LIKE ? OR c.gst_number LIKE ?)');
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (params.status && params.status.trim()) {
      conditions.push('UPPER(c.status) = UPPER(?)');
      queryParams.push(params.status.trim());
    }

    if (params.customer_type && params.customer_type.trim()) {
      conditions.push('UPPER(c.customer_type) = UPPER(?)');
      queryParams.push(params.customer_type.trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM customers c ${whereClause}`;
    const [countRows]: any = await db.query(countSql, queryParams);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT c.*, u.name as created_by_name
      FROM customers c
      LEFT JOIN users u ON c.created_by = u.id
      ${whereClause}
      ORDER BY c.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows]: any = await db.query(dataSql, [...queryParams, limit, offset]);

    return {
      customers: rows as Customer[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getCustomerById(id: number) {
    const customerSql = `
      SELECT c.*, u.name as created_by_name
      FROM customers c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `;
    const [rows]: any = await db.query(customerSql, [id]);

    if (!rows || rows.length === 0) {
      return null;
    }

    const customer: Customer = rows[0];

    const followupsSql = `
      SELECT f.*, u.name as created_by_name
      FROM customer_followups f
      LEFT JOIN users u ON f.created_by = u.id
      WHERE f.customer_id = ?
      ORDER BY f.id DESC
    `;
    const [followupRows]: any = await db.query(followupsSql, [id]);

    return {
      ...customer,
      followups: followupRows as CustomerFollowup[],
    };
  }

  static async createCustomer(data: any, createdByUserId?: number): Promise<Customer> {
    const emailTrim = data.email.trim();
    const businessTrim = data.business_name.trim();

    // Check for duplicate Email or Business Name (HTTP 409 Conflict)
    const [existing]: any = await db.query(
      'SELECT id, email, business_name FROM customers WHERE email = ? OR business_name = ?',
      [emailTrim, businessTrim]
    );

    if (existing && existing.length > 0) {
      const dup = existing[0];
      if (dup.email.toLowerCase() === emailTrim.toLowerCase()) {
        throw new CustomAPIError(`Customer with Email '${emailTrim}' already exists`, 409);
      }
      if (dup.business_name.toLowerCase() === businessTrim.toLowerCase()) {
        throw new CustomAPIError(`Customer with Business Name '${businessTrim}' already exists`, 409);
      }
    }

    const sql = `
      INSERT INTO customers
      (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.name.trim(),
      data.mobile.trim(),
      emailTrim,
      businessTrim,
      data.gst_number ? data.gst_number.trim() : null,
      data.customer_type || 'Wholesale',
      data.address ? data.address.trim() : null,
      data.status || 'Lead',
      data.follow_up_date || null,
      data.notes ? data.notes.trim() : null,
      createdByUserId || null,
    ];

    const [result]: any = await db.query(sql, params);
    const newId = result.insertId;

    if (data.notes && data.notes.trim()) {
      await this.addFollowupNote(newId, data.notes.trim(), data.follow_up_date || null, createdByUserId);
    }

    const created = await this.getCustomerById(newId);
    return created as Customer;
  }

  static async updateCustomer(id: number, data: any): Promise<Customer | null> {
    const existing = await this.getCustomerById(id);
    if (!existing) return null;

    if (data.email && data.email.trim().toLowerCase() !== existing.email.toLowerCase()) {
      const [emailCheck]: any = await db.query('SELECT id FROM customers WHERE email = ? AND id != ?', [data.email.trim(), id]);
      if (emailCheck && emailCheck.length > 0) {
        throw new CustomAPIError(`Customer Email '${data.email.trim()}' is already in use`, 409);
      }
    }

    if (data.business_name && data.business_name.trim().toLowerCase() !== existing.business_name.toLowerCase()) {
      const [bizCheck]: any = await db.query('SELECT id FROM customers WHERE business_name = ? AND id != ?', [data.business_name.trim(), id]);
      if (bizCheck && bizCheck.length > 0) {
        throw new CustomAPIError(`Business Name '${data.business_name.trim()}' is already registered`, 409);
      }
    }

    const sql = `
      UPDATE customers SET
        name = ?,
        mobile = ?,
        email = ?,
        business_name = ?,
        gst_number = ?,
        customer_type = ?,
        address = ?,
        status = ?,
        follow_up_date = ?,
        notes = ?
      WHERE id = ?
    `;

    const params = [
      data.name ? data.name.trim() : existing.name,
      data.mobile ? data.mobile.trim() : existing.mobile,
      data.email ? data.email.trim() : existing.email,
      data.business_name ? data.business_name.trim() : existing.business_name,
      data.gst_number !== undefined ? (data.gst_number ? data.gst_number.trim() : null) : existing.gst_number,
      data.customer_type || existing.customer_type,
      data.address !== undefined ? (data.address ? data.address.trim() : null) : existing.address,
      data.status || existing.status,
      data.follow_up_date !== undefined ? data.follow_up_date : existing.follow_up_date,
      data.notes !== undefined ? (data.notes ? data.notes.trim() : null) : existing.notes,
      id,
    ];

    await db.query(sql, params);
    return this.getCustomerById(id);
  }

  static async deleteCustomer(id: number): Promise<boolean> {
    const existing = await this.getCustomerById(id);
    if (!existing) return false;

    const [challans]: any = await db.query('SELECT id FROM challans WHERE customer_id = ? LIMIT 1', [id]);
    if (challans && challans.length > 0) {
      throw new CustomAPIError(`Cannot delete customer '${existing.name}' because active sales challans are linked to this account.`, 400);
    }

    await db.query('DELETE FROM customers WHERE id = ?', [id]);
    return true;
  }

  static async addFollowupNote(
    customerId: number,
    note: string,
    followUpDate?: string | null,
    createdByUserId?: number
  ): Promise<CustomerFollowup> {
    const existing = await this.getCustomerById(customerId);
    if (!existing) {
      throw new CustomAPIError('Customer not found', 404);
    }

    const sql = `
      INSERT INTO customer_followups (customer_id, note, follow_up_date, created_by)
      VALUES (?, ?, ?, ?)
    `;
    const [result]: any = await db.query(sql, [
      customerId,
      note.trim(),
      followUpDate || null,
      createdByUserId || null,
    ]);

    if (followUpDate) {
      await db.query('UPDATE customers SET follow_up_date = ?, notes = ? WHERE id = ?', [
        followUpDate,
        note.trim(),
        customerId,
      ]);
    } else {
      await db.query('UPDATE customers SET notes = ? WHERE id = ?', [note.trim(), customerId]);
    }

    const [rows]: any = await db.query(
      'SELECT f.*, u.name as created_by_name FROM customer_followups f LEFT JOIN users u ON f.created_by = u.id WHERE f.id = ?',
      [result.insertId]
    );

    return rows[0] as CustomerFollowup;
  }
}
