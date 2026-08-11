import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export class CustomAPIError extends Error {
  public statusCode: number;
  public data?: any;

  constructor(message: string, statusCode = 400, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    Object.setPrototypeOf(this, CustomAPIError.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[API Error Log] ${req.method} ${req.originalUrl}:`, err.message || err);

  const statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Sanitize SQL errors or internal database engine dump messages
  if (err.sql || err.code === 'ER_PARSE_ERROR' || err.code === 'ER_NO_SUCH_TABLE') {
    message = 'A database operation error occurred.';
  }

  return sendError(
    res,
    message,
    statusCode,
    undefined,
    err.data || undefined
  );
};
