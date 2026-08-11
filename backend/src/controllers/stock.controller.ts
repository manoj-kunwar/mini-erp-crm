import { Response, NextFunction } from 'express';
import { StockService } from '../services/stock.service';
import { sendSuccess, sendError } from '../utils/response';
import { validateStockMovementInput } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export class StockController {
  static async getMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product_id = req.query.product_id ? parseInt(req.query.product_id as string, 10) : undefined;
      const movement_type = req.query.movement_type as string;
      const search = req.query.search as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await StockService.getMovements({
        product_id,
        movement_type,
        search,
        page,
        limit,
      });

      return sendSuccess(res, 'Stock movements retrieved successfully', result.movements, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async recordMovement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validationErrors = validateStockMovementInput(req.body);
      if (validationErrors.length > 0) {
        return sendError(res, 'Validation failed', 400, validationErrors);
      }

      const { product_id, quantity_changed, movement_type, reason } = req.body;

      const movement = await StockService.recordMovement(
        Number(product_id),
        Number(quantity_changed),
        movement_type,
        reason,
        req.user?.userId
      );

      return sendSuccess(res, `Stock movement ${movement_type} recorded successfully`, movement, 201);
    } catch (error: any) {
      next(error);
    }
  }
}
