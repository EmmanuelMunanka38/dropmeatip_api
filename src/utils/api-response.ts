export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  type?: string;
  errors?: unknown;
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
  type?: string,
  errors?: unknown,
): ApiErrorResponse => ({
  success: false,
  message,
  ...(type !== undefined ? { type } : {}),
  ...(errors !== undefined ? { errors } : {}),
});
