import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiData, usePaginatedData } from '../../hooks/useApiData';
import { MockDataGenerators } from '../../utils/testing';

describe('useApiData', () => {
  const mockApiCall = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should fetch data successfully', async () => {
      const mockData = ['item1', 'item2'];
      mockApiCall.mockResolvedValue(MockDataGenerators.createMockApiResponse(mockData));

      const { result } = renderHook(() =>
        useApiData(mockApiCall, {
          onSuccess: mockOnSuccess,
          onError: mockOnError,
        })
      );

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBe(null);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const errorMessage = 'API Error';
      mockApiCall.mockResolvedValue(
        MockDataGenerators.createMockApiResponse(null, false)
      );

      const { result } = renderHook(() =>
        useApiData(mockApiCall, {
          onSuccess: mockOnSuccess,
          onError: mockOnError,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe('Test error');
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith('Test error');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockApiCall.mockRejectedValue(networkError);

      const { result } = renderHook(() =>
        useApiData(mockApiCall, {
          onError: mockOnError,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(mockOnError).toHaveBeenCalledWith('Network error');
    });
  });

  describe('Refetching', () => {
    it('should refetch data when refetch is called', async () => {
      const mockData = ['item1'];
      mockApiCall.mockResolvedValue(MockDataGenerators.createMockApiResponse(mockData));

      const { result } = renderHook(() => useApiData(mockApiCall));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiCall).toHaveBeenCalledTimes(1);

      // Call refetch
      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledTimes(2);
      });
    });

    it('should auto-refetch at specified intervals', async () => {
      const mockData = ['item1'];
      mockApiCall.mockResolvedValue(MockDataGenerators.createMockApiResponse(mockData));

      renderHook(() =>
        useApiData(mockApiCall, {
          refetchInterval: 5000, // 5 seconds
        })
      );

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledTimes(1);
      });

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledTimes(2);
      });
    });

    it('should not auto-fetch when autoFetch is false', () => {
      renderHook(() =>
        useApiData(mockApiCall, {
          autoFetch: false,
        })
      );

      expect(mockApiCall).not.toHaveBeenCalled();
    });
  });

  describe('Dependencies', () => {
    it('should refetch when dependencies change', async () => {
      const mockData = ['item1'];
      mockApiCall.mockResolvedValue(MockDataGenerators.createMockApiResponse(mockData));

      let dependency = 'value1';

      const { rerender } = renderHook(() =>
        useApiData(mockApiCall, {
          dependencies: [dependency],
        })
      );

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledTimes(1);
      });

      // Change dependency
      dependency = 'value2';
      rerender();

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Memory Management', () => {
    it('should cleanup on unmount', async () => {
      const mockData = ['item1'];
      mockApiCall.mockResolvedValue(MockDataGenerators.createMockApiResponse(mockData));

      const { unmount } = renderHook(() =>
        useApiData(mockApiCall, {
          refetchInterval: 1000,
        })
      );

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledTimes(1);
      });

      // Unmount component
      unmount();

      // Fast-forward time - should not trigger more calls
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it('should not update state after unmount', async () => {
      let resolvePromise: (value: any) => void;
      const slowApiCall = jest.fn(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
      );

      const { result, unmount } = renderHook(() => useApiData(slowApiCall));

      expect(result.current.loading).toBe(true);

      // Unmount before API call completes
      unmount();

      // Complete the API call
      act(() => {
        resolvePromise(MockDataGenerators.createMockApiResponse(['item1']));
      });

      // Should not cause any state updates or errors
      expect(slowApiCall).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Management', () => {
    it('should allow manual data updates', async () => {
      const { result } = renderHook(() =>
        useApiData(mockApiCall, { autoFetch: false })
      );

      expect(result.current.data).toBe(null);

      // Manually set data
      act(() => {
        result.current.setData(['manual-item']);
      });

      expect(result.current.data).toEqual(['manual-item']);
    });

    it('should clear errors', async () => {
      mockApiCall.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useApiData(mockApiCall));

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });
});

describe('usePaginatedData', () => {
  const mockPaginatedApiCall = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle pagination correctly', async () => {
    const mockData = MockDataGenerators.createMockArticles(5);
    mockPaginatedApiCall.mockResolvedValue(
      MockDataGenerators.createMockApiResponse(mockData)
    );

    const { result } = renderHook(() =>
      usePaginatedData(mockPaginatedApiCall, {
        pageSize: 10,
        initialPage: 1,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.data).toEqual(mockData);
    expect(mockPaginatedApiCall).toHaveBeenCalledWith(1, 10);
  });

  it('should navigate between pages', async () => {
    const mockData = MockDataGenerators.createMockArticles(5);
    mockPaginatedApiCall.mockResolvedValue(
      MockDataGenerators.createMockApiResponse(mockData)
    );

    const { result } = renderHook(() =>
      usePaginatedData(mockPaginatedApiCall, {
        pageSize: 10,
        initialPage: 1,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Go to next page
    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(mockPaginatedApiCall).toHaveBeenCalledWith(2, 10);

    // Go to previous page
    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(1);
    expect(mockPaginatedApiCall).toHaveBeenCalledWith(1, 10);
  });

  it('should go to specific page', async () => {
    const mockData = MockDataGenerators.createMockArticles(5);
    mockPaginatedApiCall.mockResolvedValue(
      MockDataGenerators.createMockApiResponse(mockData)
    );

    const { result } = renderHook(() =>
      usePaginatedData(mockPaginatedApiCall, {
        pageSize: 10,
        initialPage: 1,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Go to page 3
    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);
    expect(mockPaginatedApiCall).toHaveBeenCalledWith(3, 10);
  });
});
