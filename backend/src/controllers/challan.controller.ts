import { Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { sendSuccess, sendError } from '../utils/response';
import { validateChallanInput } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export class ChallanController {
  static async getChallans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string;
      const customer_id = req.query.customer_id ? parseInt(req.query.customer_id as string, 10) : undefined;
      const search = req.query.search as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await ChallanService.getAllChallans({
        status,
        customer_id,
        search,
        page,
        limit,
      });

      return sendSuccess(res, 'Challans retrieved successfully', result.challans, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getChallanById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(res, 'Invalid Challan ID', 400);
      }

      const challan = await ChallanService.getChallanById(id);
      if (!challan) {
        return sendError(res, 'Challan not found', 404);
      }

      return sendSuccess(res, 'Challan details retrieved successfully', challan);
    } catch (error) {
      next(error);
    }
  }

  static async createChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validationErrors = validateChallanInput(req.body);
      if (validationErrors.length > 0) {
        return sendError(res, 'Validation failed', 400, validationErrors);
      }

      const challan = await ChallanService.createChallan(req.body, req.user?.userId);
      return sendSuccess(
        res,
        `Challan ${challan.challan_number} created successfully as ${challan.status}`,
        challan,
        201
      );
    } catch (error: any) {
      next(error);
    }
  }

  static async updateChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(res, 'Invalid Challan ID', 400);
      }

      const updated = await ChallanService.updateChallan(id, req.body, req.user?.userId);
      if (!updated) {
        return sendError(res, 'Challan not found', 404);
      }

      return sendSuccess(res, 'Draft Challan updated successfully', updated);
    } catch (error: any) {
      next(error);
    }
  }

  static async confirmChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(res, 'Invalid Challan ID', 400);
      }

      const confirmed = await ChallanService.confirmChallan(id, req.user?.userId);
      return sendSuccess(res, `Challan ${confirmed.challan_number} confirmed and stock updated`, confirmed);
    } catch (error: any) {
      next(error);
    }
  }

  static async cancelChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(res, 'Invalid Challan ID', 400);
      }

      const cancelled = await ChallanService.cancelChallan(id, req.user?.userId);
      return sendSuccess(res, `Challan ${cancelled.challan_number} cancelled`, cancelled);
    } catch (error: any) {
      next(error);
    }
  }
}
