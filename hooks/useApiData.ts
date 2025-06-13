import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse } from '../services/apiService';

interface UseApiDataOptions<T> {
  initialData?: T;
  autoFetch?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  dependencies?: any[];
}

interface UseApiDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
  clearError: () => void;
}

/**
 * Custom hook for managing API data with loading states, error handling, and automatic refetching
 */
export function useApiData<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiDataOptions<T> = {}
): UseApiDataReturn<T> {
  const {
    initialData = null,
    autoFetch = true,
    refetchInterval,
    onSuccess,
    onError,
    dependencies = []
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<boolean>(true);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiCall();

      if (!mountedRef.current) return;

      if (response.success && response.data) {
        setData(response.data);
        onSuccess?.(response.data);
      } else {
        const errorMessage = response.error?.message || 'Failed to fetch data';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiCall, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch, ...dependencies]);

  // Set up interval for automatic refetching
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(fetchData, refetchInterval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [fetchData, refetchInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
    clearError
  };
}

/**
 * Hook for managing paginated API data
 */
interface UsePaginatedDataOptions<T> extends UseApiDataOptions<T[]> {
  pageSize?: number;
  initialPage?: number;
}

interface UsePaginatedDataReturn<T> extends UseApiDataReturn<T[]> {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

export function usePaginatedData<T>(
  apiCall: (page: number, limit: number) => Promise<ApiResponse<T[]>>,
  options: UsePaginatedDataOptions<T> = {}
): UsePaginatedDataReturn<T> {
  const { pageSize = 10, initialPage = 1, ...apiOptions } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const paginatedApiCall = useCallback(
    () => apiCall(currentPage, pageSize),
    [apiCall, currentPage, pageSize]
  );

  const apiData = useApiData(paginatedApiCall, {
    ...apiOptions,
    dependencies: [currentPage, pageSize, ...(apiOptions.dependencies || [])],
    onSuccess: (data) => {
      // Assume the API returns meta information about pagination
      // You might need to adjust this based on your API response structure
      apiOptions.onSuccess?.(data);
    }
  });

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  return {
    ...apiData,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage,
    prevPage,
    goToPage
  };
}
