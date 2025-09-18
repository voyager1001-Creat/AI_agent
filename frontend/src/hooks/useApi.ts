/**
 * useApi Hook
 * 提供API调用的状态管理、错误处理和重试机制
 */

import { useState, useCallback, useRef } from 'react';
import { ApiUtils, ApiResponse } from '../utils/apiUtils';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseApiOptions {
  immediate?: boolean;
  retries?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onFinally?: () => void;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * 基础useApi hook
 */
export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    immediate = false,
    retries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    onFinally
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const setData = useCallback((data: T) => {
    setState((prev: UseApiState<T>) => ({ ...prev, data, error: null, success: true }));
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev: UseApiState<T>) => ({ ...prev, error, success: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev: UseApiState<T>) => ({ ...prev, loading }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const execute = useCallback(async (...args: any[]) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的AbortController
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError('');

    try {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          // 检查是否被取消
          if (abortControllerRef.current.signal.aborted) {
            throw new Error('请求被取消');
          }

          const response = await apiFunction(...args);
          
          if (response.success) {
            setData(response.data!);
            onSuccess?.(response.data);
          } else {
            throw new Error(response.message || response.error || '请求失败');
          }

          break; // 成功则跳出重试循环
        } catch (error) {
          lastError = error as Error;
          
          if (error instanceof Error && error.message === '请求被取消') {
            throw error;
          }

          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
            continue;
          }
        }
      }

      if (lastError) {
        throw lastError;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
      onFinally?.();
      abortControllerRef.current = null;
    }
  }, [apiFunction, retries, retryDelay, onSuccess, onError, onFinally, setData, setError, setLoading]);

  // 如果设置了immediate，则在组件挂载时自动执行
  const executeRef = useRef(execute);
  executeRef.current = execute;

  // 立即执行
  if (immediate) {
    // 这里需要小心处理，避免在渲染过程中调用
    // 通常建议在useEffect中调用
  }

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    setLoading
  };
}

/**
 * 用于GET请求的hook
 */
export function useGet<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const apiFunction = useCallback(
    (params?: Record<string, any>) => {
      const queryString = params ? new URLSearchParams(params).toString() : '';
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      return ApiUtils.get<T>(url);
    },
    [endpoint]
  );

  return useApi(apiFunction, options);
}

/**
 * 用于POST请求的hook
 */
export function usePost<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const apiFunction = useCallback(
    (data?: any) => ApiUtils.post<T>(endpoint, data),
    [endpoint]
  );

  return useApi(apiFunction, options);
}

/**
 * 用于PUT请求的hook
 */
export function usePut<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const apiFunction = useCallback(
    (data?: any) => ApiUtils.put<T>(endpoint, data),
    [endpoint]
  );

  return useApi(apiFunction, options);
}

/**
 * 用于DELETE请求的hook
 */
export function useDelete<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const apiFunction = useCallback(
    () => ApiUtils.delete<T>(endpoint),
    [endpoint]
  );

  return useApi(apiFunction, options);
}

/**
 * 用于文件上传的hook
 */
export function useFileUpload<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> & { 
  upload: (file: File, onProgress?: (progress: number) => void) => Promise<void>;
  uploadProgress: number;
} {
  const [uploadProgress, setUploadProgress] = useState(0);

  const apiFunction = useCallback(
    (file: File, onProgress?: (progress: number) => void) => {
      return ApiUtils.uploadFile<T>(endpoint, file, (progress) => {
        setUploadProgress(progress);
        onProgress?.(progress);
      });
    },
    [endpoint]
  );

  const api = useApi(apiFunction, options);

  const upload = useCallback(async (file: File, onProgress?: (progress: number) => void) => {
    setUploadProgress(0);
    await api.execute(file, onProgress);
  }, [api]);

  return {
    ...api,
    upload,
    uploadProgress
  };
}

/**
 * 用于分页数据的hook
 */
export function usePaginationApi<T = any>(
  apiFunction: (page: number, pageSize: number, ...args: any[]) => Promise<ApiResponse<{ data: T[]; total: number }>>,
  options: UseApiOptions = {}
): UseApiReturn<{ data: T[]; total: number }> & {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const paginatedApiFunction = useCallback(
    (...args: any[]) => apiFunction(page, pageSize, ...args),
    [apiFunction, page, pageSize]
  );

  const api = useApi(paginatedApiFunction, options);

  const nextPage = useCallback(() => {
    setPage((prev: number) => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((prev: number) => Math.max(1, prev - 1));
  }, []);

  const hasNextPage = api.data ? page * pageSize < api.data.total : false;
  const hasPrevPage = page > 1;

  return {
    ...api,
    page,
    pageSize,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage
  };
}

export default useApi;
