/**
 * usePagination Hook
 * 提供分页状态管理和计算功能
 */

import { useState, useCallback, useMemo } from 'react';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginationReturn extends PaginationState {
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
  pageNumbers: number[];
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToPage: (page: number) => void;
  reset: () => void;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialTotalItems?: number;
  maxPageSize?: number;
  minPageSize?: number;
  pageSizeOptions?: number[];
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
}

/**
 * 分页Hook
 */
export function usePagination(options: UsePaginationOptions = {}): PaginationReturn {
  const {
    initialPage = 1,
    initialPageSize = 20,
    initialTotalItems = 0,
    maxPageSize = 100,
    minPageSize = 1,
    showPageNumbers = true,
    maxPageNumbers = 7
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(initialTotalItems);

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  // 是否有下一页
  const hasNextPage = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  // 是否有上一页
  const hasPrevPage = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  // 当前页的起始索引
  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  // 当前页的结束索引
  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalItems);
  }, [startIndex, pageSize, totalItems]);

  // 生成页码数组
  const pageNumbers = useMemo(() => {
    if (!showPageNumbers || totalPages <= 1) {
      return [];
    }

    const pages: number[] = [];
    const halfMax = Math.floor(maxPageNumbers / 2);

    let start = Math.max(1, currentPage - halfMax);
    let end = Math.min(totalPages, start + maxPageNumbers - 1);

    // 调整起始位置，确保显示maxPageNumbers个页码
    if (end - start + 1 < maxPageNumbers) {
      start = Math.max(1, end - maxPageNumbers + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages, showPageNumbers, maxPageNumbers]);

  // 设置页码
  const setPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  // 设置页面大小
  const setPageSizeCallback = useCallback((newPageSize: number) => {
    const validPageSize = Math.max(minPageSize, Math.min(newPageSize, maxPageSize));
    setPageSize(validPageSize);
    
    // 重新计算当前页，确保不超出范围
    const newTotalPages = Math.ceil(totalItems / validPageSize);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages > 0 ? newTotalPages : 1);
    }
  }, [minPageSize, maxPageSize, totalItems, currentPage]);

  // 设置总项目数
  const setTotalItemsCallback = useCallback((total: number) => {
    setTotalItems(Math.max(0, total));
    
    // 如果当前页超出新的总页数范围，重置到第一页
    const newTotalPages = Math.ceil(total / pageSize);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [pageSize, currentPage]);

  // 下一页
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev: number) => prev + 1);
    }
  }, [hasNextPage]);

  // 上一页
  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage((prev: number) => prev - 1);
    }
  }, [hasPrevPage]);

  // 跳转到第一页
  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // 跳转到最后一页
  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // 跳转到指定页
  const goToPage = useCallback((page: number) => {
    setPage(page);
  }, [setPage]);

  // 重置分页状态
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    setTotalItems(initialTotalItems);
  }, [initialPage, initialPageSize, initialTotalItems]);

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    pageNumbers,
    setPage,
    setPageSize: setPageSizeCallback,
    setTotalItems: setTotalItemsCallback,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    goToPage,
    reset
  };
}

/**
 * 用于API分页的Hook
 */
export function useApiPagination<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  options: UsePaginationOptions = {}
) {
  const pagination = usePagination(options);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取数据
  const fetchData = useCallback(async () => {
    if (pagination.totalItems === 0) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(pagination.currentPage, pagination.pageSize);
      setData(result.data);
      pagination.setTotalItems(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, pagination.currentPage, pagination.pageSize, pagination.totalItems]);

  // 当页码或页面大小改变时重新获取数据
  const handlePageChange = useCallback((page: number) => {
    pagination.setPage(page);
  }, [pagination]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    pagination.setPageSize(newPageSize);
    pagination.setPage(1); // 重置到第一页
  }, [pagination]);

  // 刷新数据
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...pagination,
    data,
    loading,
    error,
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    refresh
  };
}

/**
 * 用于无限滚动的分页Hook
 */
export function useInfinitePagination<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  options: UsePaginationOptions = {}
) {
  const pagination = usePagination(options);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const result = await fetchFunction(pagination.currentPage, pagination.pageSize);
      
      if (pagination.currentPage === 1) {
        setData(result.data);
      } else {
        setData((prev: T[]) => [...prev, ...result.data]);
      }

      pagination.setTotalItems(result.total);
      setHasMore(result.data.length === pagination.pageSize);
      
      if (result.data.length > 0) {
        pagination.nextPage();
      }
    } catch (err) {
      console.error('加载更多数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, pagination, loading, hasMore]);

  // 刷新数据
  const refresh = useCallback(async () => {
    pagination.reset();
    setData([]);
    setHasMore(true);
    await loadMore();
  }, [pagination, loadMore]);

  return {
    ...pagination,
    data,
    loading,
    hasMore,
    loadMore,
    refresh
  };
}

export default usePagination;
