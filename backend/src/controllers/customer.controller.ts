import { Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendSuccess, sendError } from '../utils/response';
import { validateCustomerInput } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export class CustomerController {
  static async getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const status = req.query.status as string;
      const customer_type = req.query.customer_type as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await CustomerService.getAllCustomers({
        search,
        status,
        customer_type,
        page,
        limit,
      });

      return sendSuccess(res, 'Customers retrieved successfully', result.customers, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(res, 'Invalid Customer ID', 400);
      }

      const customer = await CustomerService.getCustomerById(id);
      if (!customer) {
        return sendError(res, 'Customer not found', 404);
      }

      return sendSuccess(res, 'Customer details retrieved successfully', customer);
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validationErrors = validateCustomerInput(req.body);
      if (validationErrors.length > 0) {
        return sendError(res, 'Validation failed', 400, validationErrors);
      }

      const customer = await CustomerService.createCustomer(req.body, req.user?.userId);
      return sendSuccess(res, 'Customer created successfully', customer, 201);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(res, 'Invalid Customer ID', 400);
      }

      const updated = await CustomerService.updateCustomer(id, req.body);
      if (!updated) {
        return sendError(res, 'Customer not found', 404);
      }

      return sendSuccess(res, 'Customer updated successfully', updated);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(res, 'Invalid Customer ID', 400);
      }

      const deleted = await CustomerService.deleteCustomer(id);
      if (!deleted) {
        return sendError(res, 'Customer not found', 404);
      }

      return sendSuccess(res, 'Customer deleted successfully', { id });
    } catch (error: any) {
      next(error);
    }
  }

  static async addFollowupNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = parseInt(req.params.id, 10);
      if (isNaN(customerId)) {
        return sendError(res, 'Invalid Customer ID', 400);
      }

      const { note, follow_up_date } = req.body;
      if (!note || typeof note !== 'string' || !note.trim()) {
        return sendError(res, 'Follow-up note is required', 400);
      }

      const followup = await CustomerService.addFollowupNote(
        customerId,
        note,
        follow_up_date,
        req.user?.userId
      );

      return sendSuccess(res, 'Follow-up note added successfully', followup, 201);
    } catch (error: any) {
      next(error);
    }
  }
}
