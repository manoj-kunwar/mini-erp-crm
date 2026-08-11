import { Router } from 'express';
import { StockController } from '../controllers/stock.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/movements',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  StockController.getMovements
);

router.post(
  '/movements',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  StockController.recordMovement
);

export default router;
