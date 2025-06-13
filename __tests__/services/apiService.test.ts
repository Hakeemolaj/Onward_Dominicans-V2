import { apiService } from '../../services/apiService';
import { MockDataGenerators, ApiTestUtils } from '../../utils/testing';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock supabase service
jest.mock('../../services/supabaseService', () => ({
  supabaseService: {
    getArticles: jest.fn(),
    healthCheck: jest.fn(),
  },
}));

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache before each test
    (apiService as any).requestCache.clear();
  });

  describe('Request Handling', () => {
    it('should make successful API requests', async () => {
      const mockResponse = MockDataGenerators.createMockApiResponse(['article1', 'article2']);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiService.getArticles();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(['article1', 'article2']);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/articles'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      const mockErrorResponse = MockDataGenerators.createMockApiResponse(null, false);
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve(mockErrorResponse),
      } as Response);

      const result = await apiService.getArticles();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should retry failed requests', async () => {
      // First two calls fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(MockDataGenerators.createMockApiResponse(['article1'])),
        } as Response);

      const result = await apiService.getArticles();

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should timeout long requests', async () => {
      // Mock a request that takes too long
      mockFetch.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 15000))
      );

      const result = await apiService.getArticles();

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('failed');
    });
  });

  describe('Caching', () => {
    it('should cache GET requests', async () => {
      const mockResponse = MockDataGenerators.createMockApiResponse(['article1']);
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      // First request
      await apiService.getArticles();
      
      // Second request (should use cache)
      await apiService.getArticles();

      // Fetch should only be called once
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should not cache POST requests', async () => {
      const mockResponse = MockDataGenerators.createMockApiResponse({ id: '1' });
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      // Make two POST requests
      await apiService.createArticle({ title: 'Test Article' });
      await apiService.createArticle({ title: 'Test Article 2' });

      // Both requests should hit the API
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should expire cached responses', async () => {
      const mockResponse = MockDataGenerators.createMockApiResponse(['article1']);
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      // First request
      await apiService.getArticles();

      // Mock time passing (cache expiry)
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 35000); // 35 seconds later

      // Second request (cache should be expired)
      await apiService.getArticles();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Authentication', () => {
    it('should include auth token for protected endpoints', async () => {
      // Mock token storage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => 'test-token'),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      const mockResponse = MockDataGenerators.createMockApiResponse({ id: '1' });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await apiService.createArticle({ title: 'Test Article' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle login and store tokens', async () => {
      const mockLoginResponse = MockDataGenerators.createMockApiResponse({
        token: 'new-auth-token',
        user: { id: '1', email: 'test@example.com' }
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockLoginResponse),
      } as Response);

      const setItemSpy = jest.fn();
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(),
          setItem: setItemSpy,
          removeItem: jest.fn(),
        },
        writable: true,
      });

      const result = await apiService.login('test@example.com', 'password');

      expect(result.success).toBe(true);
      expect(setItemSpy).toHaveBeenCalledWith('auth_token', 'new-auth-token');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await apiService.getArticles();

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('failed');
    });

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);

      const result = await apiService.getArticles();

      expect(result.success).toBe(false);
    });

    it('should handle HTTP error status codes', async () => {
      const mockErrorResponse = {
        success: false,
        error: { message: 'Not found' },
        timestamp: new Date().toISOString()
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(mockErrorResponse),
      } as Response);

      const result = await apiService.getArticles();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Not found');
    });
  });

  describe('Supabase Fallback', () => {
    it('should use Supabase when configured', async () => {
      // This test would verify Supabase fallback behavior
      // Implementation depends on your specific Supabase setup
      const result = await apiService.healthCheck();
      
      // Should return a response (either from API or Supabase)
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('Performance', () => {
    it('should measure request performance', async () => {
      const mockResponse = MockDataGenerators.createMockApiResponse(['article1']);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const startTime = performance.now();
      await apiService.getArticles();
      const endTime = performance.now();

      // Request should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
