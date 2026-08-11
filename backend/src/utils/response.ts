import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
  pagination?: ApiResponse['pagination']
): Response => {
  const responsePayload: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(pagination ? { pagination } : {}),
  };
  return res.status(statusCode).json(responsePayload);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: string[],
  data?: any
): Response => {
  const responsePayload: ApiResponse = {
    success: false,
    message,
    ...(data ? { data } : {}),
    ...(errors && errors.length > 0 ? { errors } : {}),
  };
  return res.status(statusCode).json(responsePayload);
};
