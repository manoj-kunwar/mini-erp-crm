import dotenv from 'dotenv';
import app from './app';
import { db } from './config/db';

dotenv.config();

let PORT = parseInt(process.env.PORT || '5001', 10);

const startServer = async () => {
  try {
    // Initialize database pool & schemas
    await db.init();

    const listenOnPort = (portToTry: number) => {
      const server = app.listen(portToTry, () => {
        console.log(`=======================================================`);
        console.log(`  Mini ERP + CRM Backend Server running on port ${portToTry}`);
        console.log(`  Database Engine: ${db.driverName}`);
        console.log(`  Health Check: http://localhost:${portToTry}/health`);
        console.log(`=======================================================`);
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`Port ${portToTry} is already in use. Retrying on port ${portToTry + 1}...`);
          listenOnPort(portToTry + 1);
        } else {
          console.error('Server error:', err);
        }
      });
    };

    listenOnPort(PORT);
  } catch (error: any) {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  }
};

startServer();
