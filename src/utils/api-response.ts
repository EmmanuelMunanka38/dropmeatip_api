export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
  stack?: string;
}

export const successResponse = <T>(
  data: T,
  message?: string,
): ApiSuccessResponse<T> => ({
  success: true,
  ...(message !== undefined ? { message } : {}),
  data,
});

export const errorResponse = (
  message: string,
  errors?: unknown,
  stack?: string,
): ApiErrorResponse => ({
  success: false,
  message,
  ...(errors !== undefined ? { errors } : {}),
  ...(stack !== undefined ? { stack } : {}),
});
