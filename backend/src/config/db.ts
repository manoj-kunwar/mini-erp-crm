import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let mysqlPool: mysql.Pool | null = null;

export interface DBTransactionConnection {
  query: (sql: string, params?: any[]) => Promise<[any[], any]>;
  execute: (sql: string, params?: any[]) => Promise<[any, any]>;
  beginTransaction: () => Promise<void>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  release: () => void;
}

class DatabaseManager {
  public isConnected = false;
  public driverName = 'MySQL';

  async init() {
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '3306', 10);
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'mini_erp_crm';

    console.log(`Connecting to MySQL server at ${host}:${port} as user '${user}'...`);

    try {
      // 1. Connect to MySQL server to ensure target database exists
      const initConn = await mysql.createConnection({ host, port, user, password });
      await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
      await initConn.end();

      // 2. Create MySQL connection pool
      mysqlPool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 15,
        queueLimit: 0,
        multipleStatements: true,
      });

      // 3. Test pool connectivity
      const testConn = await mysqlPool.getConnection();
      testConn.release();

      this.isConnected = true;
      console.log(`Successfully established MySQL connection pool for database '${database}'.`);

      await this.bootstrapSchemaAndSeed();
    } catch (err: any) {
      this.isConnected = false;
      console.error(`FATAL DATABASE ERROR: Unable to connect to MySQL database at ${host}:${port}.`);
      console.error(`Reason: ${err.message}`);
      throw new Error(`MySQL Connection Failed: ${err.message}`);
    }
  }

  private async bootstrapSchemaAndSeed() {
    if (!mysqlPool) return;
    try {
      const [rows]: any = await mysqlPool.query("SHOW TABLES LIKE 'users';");
      if (rows.length === 0) {
        console.log('Initializing MySQL schema and seed dataset...');
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const seedPath = path.join(__dirname, '../../database/seed.sql');

        if (fs.existsSync(schemaPath)) {
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          await mysqlPool.query(schemaSql);
        }
        if (fs.existsSync(seedPath)) {
          const seedSql = fs.readFileSync(seedPath, 'utf8');
          await mysqlPool.query(seedSql);
        }
        console.log('MySQL schema and seed dataset initialized successfully.');
      }
    } catch (error: any) {
      console.error('Error during MySQL schema initialization:', error.message);
      throw error;
    }
  }

  async query(sql: string, params: any[] = []): Promise<[any[], any]> {
    if (!mysqlPool) {
      throw new Error('MySQL connection pool is not initialized.');
    }
    return mysqlPool.query(sql, params);
  }

  async execute(sql: string, params: any[] = []): Promise<[any, any]> {
    if (!mysqlPool) {
      throw new Error('MySQL connection pool is not initialized.');
    }
    return mysqlPool.execute(sql, params);
  }

  async getConnection(): Promise<DBTransactionConnection> {
    if (!mysqlPool) {
      throw new Error('MySQL connection pool is not initialized.');
    }
    const conn = await mysqlPool.getConnection();
    return {
      query: (sql: string, params: any[] = []) => conn.query(sql, params),
      execute: (sql: string, params: any[] = []) => conn.execute(sql, params),
      beginTransaction: () => conn.beginTransaction(),
      commit: () => conn.commit(),
      rollback: () => conn.rollback(),
      release: () => conn.release(),
    };
  }
}

export const db = new DatabaseManager();
