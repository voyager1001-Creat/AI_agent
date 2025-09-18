/**
 * useErrorHandler Hook
 * 提供错误处理功能
 */

import { useState, useCallback } from 'react';

export interface ErrorState {
  error: string | null;
  hasError: boolean;
}

export interface UseErrorHandlerReturn extends ErrorState {
  setError: (error: string | null) => void;
  clearError: () => void;
  handleError: (error: unknown) => void;
}

/**
 * 错误处理Hook
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError(error.message);
    } else if (typeof error === 'string') {
      setError(error);
    } else {
      setError('发生未知错误');
    }
  }, []);

  return {
    error,
    hasError: error !== null,
    setError,
    clearError,
    handleError
  };
}

export default useErrorHandler;