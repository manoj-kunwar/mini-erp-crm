import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  authorizeRoles('ADMIN', 'SALES'),
  CustomerController.getCustomers
);

router.get(
  '/:id',
  authorizeRoles('ADMIN', 'SALES'),
  CustomerController.getCustomerById
);

router.post(
  '/',
  authorizeRoles('ADMIN', 'SALES'),
  CustomerController.createCustomer
);

router.put(
  '/:id',
  authorizeRoles('ADMIN', 'SALES'),
  CustomerController.updateCustomer
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  CustomerController.deleteCustomer
);

router.post(
  '/:id/followups',
  authorizeRoles('ADMIN', 'SALES'),
  CustomerController.addFollowupNote
);

export default router;
