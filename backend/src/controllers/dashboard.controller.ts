import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess, sendError } from '../utils/response';

export class DashboardController {
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Authentication required', 401);
      }

      const data = await DashboardService.getDashboardDataByRole(req.user.role);
      return sendSuccess(res, `Dashboard data retrieved for role '${req.user.role}'`, data);
    } catch (error: any) {
      next(error);
    }
  }

  static async getAdminDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getAdminDashboard();
      return sendSuccess(res, 'Admin dashboard data retrieved successfully', data);
    } catch (error: any) {
      next(error);
    }
  }

  static async getSalesDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getSalesDashboard();
      return sendSuccess(res, 'Sales dashboard data retrieved successfully', data);
    } catch (error: any) {
      next(error);
    }
  }

  static async getWarehouseDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getWarehouseDashboard();
      return sendSuccess(res, 'Warehouse dashboard data retrieved successfully', data);
    } catch (error: any) {
      next(error);
    }
  }

  static async getAccountsDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getAccountsDashboard();
      return sendSuccess(res, 'Accounts dashboard data retrieved successfully', data);
    } catch (error: any) {
      next(error);
    }
  }
}
