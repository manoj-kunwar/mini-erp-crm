import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'),
  ChallanController.getChallans
);

router.get(
  '/:id',
  authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'),
  ChallanController.getChallanById
);

router.post(
  '/',
  authorizeRoles('ADMIN', 'SALES'),
  ChallanController.createChallan
);

router.put(
  '/:id',
  authorizeRoles('ADMIN', 'SALES'),
  ChallanController.updateChallan
);

router.post(
  '/:id/confirm',
  authorizeRoles('ADMIN', 'SALES'),
  ChallanController.confirmChallan
);

router.post(
  '/:id/cancel',
  authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'),
  ChallanController.cancelChallan
);

export default router;
