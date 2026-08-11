import { Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { sendSuccess, sendError } from '../utils/response';
import { validateProductInput } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export class ProductController {
  static async getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const category = req.query.category as string;
      const low_stock = req.query.low_stock === 'true';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await ProductService.getAllProducts({
        search,
        category,
        low_stock,
        page,
        limit,
      });

      return sendSuccess(res, 'Products retrieved successfully', result.products, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(res, 'Invalid Product ID', 400);
      }

      const product = await ProductService.getProductById(id);
      if (!product) {
        return sendError(res, 'Product not found', 404);
      }

      return sendSuccess(res, 'Product details retrieved successfully', product);
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validationErrors = validateProductInput(req.body);
      if (validationErrors.length > 0) {
        return sendError(res, 'Validation failed', 400, validationErrors);
      }

      const product = await ProductService.createProduct(req.body, req.user?.userId);
      return sendSuccess(res, 'Product created successfully', product, 201);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(res, 'Invalid Product ID', 400);
      }

      const updated = await ProductService.updateProduct(id, req.body);
      if (!updated) {
        return sendError(res, 'Product not found', 404);
      }

      return sendSuccess(res, 'Product updated successfully', updated);
    } catch (error: any) {
      next(error);
    }
  }
}
