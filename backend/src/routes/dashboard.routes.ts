import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// Generic endpoint - evaluates user role dynamically from token
router.get('/', DashboardController.getDashboard);

// Explicit role endpoints
router.get('/admin', authorizeRoles('ADMIN'), DashboardController.getAdminDashboard);
router.get('/sales', authorizeRoles('ADMIN', 'SALES'), DashboardController.getSalesDashboard);
router.get('/warehouse', authorizeRoles('ADMIN', 'WAREHOUSE'), DashboardController.getWarehouseDashboard);
router.get('/accounts', authorizeRoles('ADMIN', 'ACCOUNTS'), DashboardController.getAccountsDashboard);

export default router;
