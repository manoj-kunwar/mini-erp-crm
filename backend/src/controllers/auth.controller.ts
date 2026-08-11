import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { CustomAPIError } from '../middleware/errorHandler';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return sendError(res, 'Username/Email and Password are required', 400);
      }

      const result = await AuthService.login(username.trim(), password);
      return sendSuccess(res, 'Login successful', result);
    } catch (error: any) {
      next(new CustomAPIError(error.message || 'Login failed', 401));
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const user = await AuthService.getUserById(req.user.userId);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, 'User profile retrieved successfully', user);
    } catch (error: any) {
      next(error);
    }
  }
}
