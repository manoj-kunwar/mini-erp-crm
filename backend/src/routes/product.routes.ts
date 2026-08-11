import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE'),
  ProductController.getProducts
);

router.get(
  '/:id',
  authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE'),
  ProductController.getProductById
);

router.post(
  '/',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  ProductController.createProduct
);

router.put(
  '/:id',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  ProductController.updateProduct
);

export default router;
