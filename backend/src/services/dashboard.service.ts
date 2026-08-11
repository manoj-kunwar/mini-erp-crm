import { db } from '../config/db';
import { UserRole } from '../types';

export class DashboardService {
  static async getDashboardDataByRole(role: UserRole) {
    switch (role) {
      case 'ADMIN':
        return this.getAdminDashboard();
      case 'SALES':
        return this.getSalesDashboard();
      case 'WAREHOUSE':
        return this.getWarehouseDashboard();
      case 'ACCOUNTS':
        return this.getAccountsDashboard();
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }

  static async getAdminDashboard() {
    const [custRow]: any = await db.query('SELECT COUNT(*) as total FROM customers');
    const [prodRow]: any = await db.query('SELECT COUNT(*) as total, IFNULL(SUM(current_stock), 0) as total_stock, SUM(CASE WHEN current_stock <= min_stock_alert THEN 1 ELSE 0 END) as low_stock FROM products');
    const [chalRow]: any = await db.query("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draft_count, SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed_count FROM challans");
    const [userRow]: any = await db.query('SELECT COUNT(*) as total FROM users');
    const [smRow]: any = await db.query('SELECT COUNT(*) as total FROM stock_movements');

    const [lowStockProducts]: any = await db.query(
      'SELECT id, name, sku, category, current_stock, min_stock_alert, location FROM products WHERE current_stock <= min_stock_alert ORDER BY current_stock ASC LIMIT 5'
    );

    const [recentChallans]: any = await db.query(
      `SELECT c.id, c.challan_number, c.total_amount, c.status, c.created_at, cust.name as customer_name, cust.business_name
       FROM challans c
       LEFT JOIN customers cust ON c.customer_id = cust.id
       ORDER BY c.id DESC LIMIT 5`
    );

    const [recentMovements]: any = await db.query(
      `SELECT sm.id, sm.quantity_changed, sm.movement_type, sm.reason, sm.timestamp, p.name as product_name, p.sku, u.name as created_by_name
       FROM stock_movements sm
       LEFT JOIN products p ON sm.product_id = p.id
       LEFT JOIN users u ON sm.created_by = u.id
       ORDER BY sm.id DESC LIMIT 5`
    );

    return {
      role: 'ADMIN',
      metrics: {
        totalCustomers: Number(custRow[0]?.total || 0),
        totalProducts: Number(prodRow[0]?.total || 0),
        totalStockUnits: Number(prodRow[0]?.total_stock || 0),
        lowStockItems: Number(prodRow[0]?.low_stock || 0),
        totalChallans: Number(chalRow[0]?.total || 0),
        draftChallans: Number(chalRow[0]?.draft_count || 0),
        confirmedChallans: Number(chalRow[0]?.confirmed_count || 0),
      },
      lowStockProducts,
      recentChallans,
      recentMovements,
      overallActivity: {
        totalUsers: Number(userRow[0]?.total || 0),
        totalCustomers: Number(custRow[0]?.total || 0),
        totalProducts: Number(prodRow[0]?.total || 0),
        totalChallans: Number(chalRow[0]?.total || 0),
        totalStockMovements: Number(smRow[0]?.total || 0),
      },
    };
  }

  static async getSalesDashboard() {
    const [custRow]: any = await db.query(
      "SELECT COUNT(*) as total, SUM(CASE WHEN UPPER(status) = 'ACTIVE' THEN 1 ELSE 0 END) as active_count FROM customers"
    );
    const [chalRow]: any = await db.query(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draft_count, SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed_count FROM challans"
    );
    const [followupCountRow]: any = await db.query(
      'SELECT COUNT(DISTINCT customer_id) as total FROM customer_followups WHERE follow_up_date IS NOT NULL'
    );

    const [recentCustomers]: any = await db.query(
      `SELECT c.id, c.name, c.business_name, c.mobile, c.email, c.customer_type, c.status, c.created_at, u.name as created_by_name
       FROM customers c
       LEFT JOIN users u ON c.created_by = u.id
       ORDER BY c.id DESC LIMIT 5`
    );

    const [recentChallans]: any = await db.query(
      `SELECT c.id, c.challan_number, c.total_amount, c.total_quantity, c.status, c.created_at, cust.name as customer_name, cust.business_name
       FROM challans c
       LEFT JOIN customers cust ON c.customer_id = cust.id
       ORDER BY c.id DESC LIMIT 5`
    );

    const [customerFollowups]: any = await db.query(
      `SELECT f.id, f.customer_id, f.note, f.follow_up_date, f.created_at, cust.name as customer_name, cust.business_name, u.name as created_by_name
       FROM customer_followups f
       LEFT JOIN customers cust ON f.customer_id = cust.id
       LEFT JOIN users u ON f.created_by = u.id
       ORDER BY f.id DESC LIMIT 5`
    );

    return {
      role: 'SALES',
      metrics: {
        totalCustomers: Number(custRow[0]?.total || 0),
        activeCustomers: Number(custRow[0]?.active_count || 0),
        totalChallans: Number(chalRow[0]?.total || 0),
        draftChallans: Number(chalRow[0]?.draft_count || 0),
        confirmedChallans: Number(chalRow[0]?.confirmed_count || 0),
        pendingFollowups: Number(followupCountRow[0]?.total || 0),
      },
      recentCustomers,
      recentChallans,
      customerFollowups,
      salesActivity: {
        totalCustomers: Number(custRow[0]?.total || 0),
        totalOrders: Number(chalRow[0]?.total || 0),
      },
    };
  }

  static async getWarehouseDashboard() {
    const [prodRow]: any = await db.query(
      `SELECT COUNT(*) as total,
              IFNULL(SUM(current_stock), 0) as total_stock,
              SUM(CASE WHEN current_stock <= min_stock_alert AND current_stock > 0 THEN 1 ELSE 0 END) as low_stock,
              SUM(CASE WHEN current_stock = 0 THEN 1 ELSE 0 END) as out_of_stock
       FROM products`
    );

    const [movementsSummaryRow]: any = await db.query(
      `SELECT
         IFNULL(SUM(CASE WHEN movement_type = 'IN' THEN quantity_changed ELSE 0 END), 0) as total_in,
         IFNULL(SUM(CASE WHEN movement_type = 'OUT' THEN quantity_changed ELSE 0 END), 0) as total_out
       FROM stock_movements`
    );

    const [lowStockProducts]: any = await db.query(
      `SELECT id, name, sku, category, current_stock, min_stock_alert, location,
              CASE WHEN current_stock = 0 THEN 'OUT_OF_STOCK' ELSE 'LOW_STOCK' END as stock_status
       FROM products
       WHERE current_stock <= min_stock_alert
       ORDER BY current_stock ASC LIMIT 10`
    );

    const [recentMovements]: any = await db.query(
      `SELECT sm.id, sm.product_id, sm.quantity_changed, sm.movement_type, sm.reason, sm.timestamp,
              p.name as product_name, p.sku, u.name as created_by_name
       FROM stock_movements sm
       LEFT JOIN products p ON sm.product_id = p.id
       LEFT JOIN users u ON sm.created_by = u.id
       ORDER BY sm.id DESC LIMIT 10`
    );

    return {
      role: 'WAREHOUSE',
      metrics: {
        totalProducts: Number(prodRow[0]?.total || 0),
        totalStockUnits: Number(prodRow[0]?.total_stock || 0),
        lowStockItems: Number(prodRow[0]?.low_stock || 0),
        outOfStockItems: Number(prodRow[0]?.out_of_stock || 0),
        recentStockIn: Number(movementsSummaryRow[0]?.total_in || 0),
        recentStockOut: Number(movementsSummaryRow[0]?.total_out || 0),
      },
      lowStockProducts,
      recentMovements,
    };
  }

  static async getAccountsDashboard() {
    const [chalRow]: any = await db.query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed_count,
              SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as pending_count,
              IFNULL(SUM(total_amount), 0) as total_sales_amount,
              IFNULL(SUM(CASE WHEN status = 'DRAFT' THEN total_amount ELSE 0 END), 0) as pending_amount,
              IFNULL(SUM(CASE WHEN status = 'CONFIRMED' THEN total_amount ELSE 0 END), 0) as confirmed_amount
       FROM challans`
    );

    const [recentChallans]: any = await db.query(
      `SELECT c.id, c.challan_number, c.total_amount, c.total_quantity, c.status, c.created_at,
              cust.name as customer_name, cust.business_name
       FROM challans c
       LEFT JOIN customers cust ON c.customer_id = cust.id
       ORDER BY c.id DESC LIMIT 10`
    );

    const totalSales = Number(chalRow[0]?.total_sales_amount || 0);
    const confirmedAmount = Number(chalRow[0]?.confirmed_amount || 0);
    const pendingAmount = Number(chalRow[0]?.pending_amount || 0);

    return {
      role: 'ACCOUNTS',
      metrics: {
        totalChallans: Number(chalRow[0]?.total || 0),
        confirmedChallans: Number(chalRow[0]?.confirmed_count || 0),
        pendingChallans: Number(chalRow[0]?.pending_count || 0),
        totalSalesAmount: totalSales,
        pendingAmount: pendingAmount,
        confirmedAmount: confirmedAmount,
      },
      recentChallans,
      financialSummary: {
        totalSales,
        confirmedAmount,
        pendingAmount,
      },
    };
  }
}
