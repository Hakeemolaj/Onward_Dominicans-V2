/**
 * Testing utilities for better test functions
 */

/**
 * Mock data generators
 */
export const MockDataGenerators = {
  /**
   * Generate mock news article
   */
  createMockArticle: (overrides: Partial<any> = {}) => ({
    id: `article-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Sample Article Title',
    summary: 'This is a sample article summary for testing purposes.',
    content: 'Full article content goes here...',
    imageUrl: 'https://picsum.photos/400/250',
    category: 'General',
    author: {
      name: 'Test Author',
      avatarUrl: 'https://picsum.photos/50/50',
      bio: 'Test author bio'
    },
    date: new Date().toLocaleDateString(),
    slug: 'sample-article-title',
    tags: ['test', 'sample'],
    ...overrides
  }),

  /**
   * Generate multiple mock articles
   */
  createMockArticles: (count: number = 5) => {
    return Array.from({ length: count }, (_, index) =>
      MockDataGenerators.createMockArticle({
        id: `article-${index + 1}`,
        title: `Sample Article ${index + 1}`,
        slug: `sample-article-${index + 1}`
      })
    );
  },

  /**
   * Generate mock gallery item
   */
  createMockGalleryItem: (overrides: Partial<any> = {}) => ({
    id: `gallery-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Sample Gallery Item',
    description: 'Sample gallery item description',
    imageUrl: 'https://picsum.photos/800/600',
    category: 'General',
    tags: ['test', 'gallery'],
    ...overrides
  }),

  /**
   * Generate mock API response
   */
  createMockApiResponse: <T>(data: T, success: boolean = true) => ({
    success,
    data: success ? data : undefined,
    error: success ? undefined : { message: 'Test error' },
    timestamp: new Date().toISOString()
  })
};

/**
 * Test utilities for API mocking
 */
export const ApiTestUtils = {
  /**
   * Mock fetch responses
   */
  mockFetch: (responses: { url: string; response: any; status?: number }[]) => {
    const originalFetch = global.fetch;
    
    global.fetch = jest.fn((url: string) => {
      const mockResponse = responses.find(r => url.includes(r.url));
      
      if (mockResponse) {
        return Promise.resolve({
          ok: (mockResponse.status || 200) < 400,
          status: mockResponse.status || 200,
          json: () => Promise.resolve(mockResponse.response)
        } as Response);
      }
      
      return Promise.reject(new Error(`No mock response for ${url}`));
    });

    return () => {
      global.fetch = originalFetch;
    };
  },

  /**
   * Mock API service methods
   */
  mockApiService: (methods: Record<string, any>) => {
    const originalMethods: Record<string, any> = {};
    
    Object.keys(methods).forEach(methodName => {
      if (typeof methods[methodName] === 'function') {
        originalMethods[methodName] = (global as any).apiService?.[methodName];
        if ((global as any).apiService) {
          (global as any).apiService[methodName] = methods[methodName];
        }
      }
    });

    return () => {
      Object.keys(originalMethods).forEach(methodName => {
        if ((global as any).apiService && originalMethods[methodName]) {
          (global as any).apiService[methodName] = originalMethods[methodName];
        }
      });
    };
  }
};

/**
 * Component testing utilities
 */
export const ComponentTestUtils = {
  /**
   * Wait for async operations
   */
  waitFor: (condition: () => boolean, timeout: number = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 100);
        }
      };
      
      check();
    });
  },

  /**
   * Simulate user interactions
   */
  simulateClick: (element: HTMLElement) => {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(event);
  },

  simulateInput: (element: HTMLInputElement, value: string) => {
    element.value = value;
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
  },

  simulateKeyPress: (element: HTMLElement, key: string) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }
};

/**
 * Performance testing utilities
 */
export const PerformanceTestUtils = {
  /**
   * Measure component render time
   */
  measureRenderTime: async (renderFn: () => void): Promise<number> => {
    const start = performance.now();
    renderFn();
    
    // Wait for next frame
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    return performance.now() - start;
  },

  /**
   * Test memory usage
   */
  measureMemoryUsage: (): number => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  },

  /**
   * Benchmark function execution
   */
  benchmark: (fn: () => void, iterations: number = 1000): {
    average: number;
    min: number;
    max: number;
    total: number;
  } => {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      times.push(performance.now() - start);
    }
    
    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      total: times.reduce((a, b) => a + b, 0)
    };
  }
};

/**
 * Database testing utilities
 */
export const DatabaseTestUtils = {
  /**
   * Create test database connection
   */
  createTestDb: () => {
    // Mock database implementation for testing
    const data = new Map();
    
    return {
      create: (table: string, record: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        const fullRecord = { id, ...record, createdAt: new Date() };
        
        if (!data.has(table)) {
          data.set(table, new Map());
        }
        
        data.get(table).set(id, fullRecord);
        return fullRecord;
      },
      
      findMany: (table: string, where: any = {}) => {
        if (!data.has(table)) return [];
        
        const records = Array.from(data.get(table).values());
        
        if (Object.keys(where).length === 0) {
          return records;
        }
        
        return records.filter(record => {
          return Object.keys(where).every(key => record[key] === where[key]);
        });
      },
      
      findUnique: (table: string, where: any) => {
        const records = data.get(table);
        if (!records) return null;
        
        for (const record of records.values()) {
          if (Object.keys(where).every(key => record[key] === where[key])) {
            return record;
          }
        }
        
        return null;
      },
      
      update: (table: string, where: any, updateData: any) => {
        const record = DatabaseTestUtils.createTestDb().findUnique(table, where);
        if (record) {
          Object.assign(record, updateData, { updatedAt: new Date() });
          return record;
        }
        return null;
      },
      
      delete: (table: string, where: any) => {
        const records = data.get(table);
        if (!records) return null;
        
        for (const [id, record] of records.entries()) {
          if (Object.keys(where).every(key => record[key] === where[key])) {
            records.delete(id);
            return record;
          }
        }
        
        return null;
      },
      
      clear: () => data.clear()
    };
  }
};

/**
 * Test assertion helpers
 */
export const TestAssertions = {
  /**
   * Assert API response structure
   */
  assertApiResponse: (response: any, expectedData?: any) => {
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('timestamp');
    
    if (response.success) {
      expect(response).toHaveProperty('data');
      if (expectedData) {
        expect(response.data).toEqual(expectedData);
      }
    } else {
      expect(response).toHaveProperty('error');
      expect(response.error).toHaveProperty('message');
    }
  },

  /**
   * Assert component accessibility
   */
  assertAccessibility: (element: HTMLElement) => {
    // Check for basic accessibility attributes
    const interactiveElements = element.querySelectorAll('button, a, input, select, textarea');
    
    interactiveElements.forEach(el => {
      if (el.tagName === 'BUTTON' || el.tagName === 'A') {
        expect(el).toHaveAttribute('aria-label');
      }
      
      if (el.tagName === 'INPUT') {
        const input = el as HTMLInputElement;
        if (input.type !== 'hidden') {
          expect(el.closest('label') || el.getAttribute('aria-label')).toBeTruthy();
        }
      }
    });
  }
};
