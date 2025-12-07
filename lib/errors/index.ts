export class AppError extends Error {
  constructor(public message: string, public code: string, public statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export const handleServiceError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);
  if (error instanceof AppError) {
    throw error;
  }
  throw new AppError('An unexpected error occurred', 'INTERNAL_SERVER_ERROR');
};
