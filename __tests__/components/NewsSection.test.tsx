import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewsSection from '../../components/NewsSection';
import { MockDataGenerators, ApiTestUtils, ComponentTestUtils } from '../../utils/testing';
import { apiService } from '../../services/apiService';

// Mock the API service
jest.mock('../../services/apiService');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock the performance utilities
jest.mock('../../utils/performance', () => ({
  MemoCache: {
    memoize: jest.fn((fn) => fn),
  },
  PerformanceMonitor: {
    measureAsync: jest.fn((name, fn) => fn()),
    measureSync: jest.fn((name, fn) => fn()),
  },
}));

// Mock the error handler
jest.mock('../../utils/errorHandling', () => ({
  useErrorHandler: () => ({
    handleError: jest.fn(),
  }),
}));

describe('NewsSection', () => {
  const mockProps = {
    id: 'news-section',
    searchTerm: '',
    activeCategory: null,
    onCategoryChange: jest.fn(),
    onSearchChange: jest.fn(),
    onReadMoreClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Article Loading', () => {
    it('should load and display articles successfully', async () => {
      const mockArticles = MockDataGenerators.createMockArticles(3);
      mockApiService.getArticles.mockResolvedValue(
        MockDataGenerators.createMockApiResponse(mockArticles)
      );

      render(<NewsSection {...mockProps} />);

      // Should show loading initially
      expect(screen.getByText('Loading articles...')).toBeInTheDocument();

      // Wait for articles to load
      await waitFor(() => {
        expect(screen.getByText('Sample Article 1')).toBeInTheDocument();
      });

      // Should display all articles
      expect(screen.getByText('Sample Article 1')).toBeInTheDocument();
      expect(screen.getByText('Sample Article 2')).toBeInTheDocument();
      expect(screen.getByText('Sample Article 3')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      mockApiService.getArticles.mockResolvedValue(
        MockDataGenerators.createMockApiResponse(null, false)
      );

      render(<NewsSection {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Error loading articles/)).toBeInTheDocument();
      });

      // Should show retry button
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should retry loading articles when retry button is clicked', async () => {
      // First call fails
      mockApiService.getArticles
        .mockResolvedValueOnce(MockDataGenerators.createMockApiResponse(null, false))
        .mockResolvedValueOnce(
          MockDataGenerators.createMockApiResponse(MockDataGenerators.createMockArticles(1))
        );

      render(<NewsSection {...mockProps} />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      // Click retry
      fireEvent.click(screen.getByText('Retry'));

      // Should load articles successfully
      await waitFor(() => {
        expect(screen.getByText('Sample Article 1')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering and Sorting', () => {
    beforeEach(async () => {
      const mockArticles = [
        MockDataGenerators.createMockArticle({
          id: '1',
          title: 'Culture Article',
          category: 'Culture',
          date: '2024-01-01',
        }),
        MockDataGenerators.createMockArticle({
          id: '2',
          title: 'News Article',
          category: 'News',
          date: '2024-01-02',
        }),
        MockDataGenerators.createMockArticle({
          id: '3',
          title: 'Sports Article',
          category: 'Sports',
          date: '2024-01-03',
        }),
      ];

      mockApiService.getArticles.mockResolvedValue(
        MockDataGenerators.createMockApiResponse(mockArticles)
      );
    });

    it('should filter articles by category', async () => {
      render(<NewsSection {...mockProps} activeCategory="Culture" />);

      await waitFor(() => {
        expect(screen.getByText('Culture Article')).toBeInTheDocument();
      });

      // Should only show culture articles
      expect(screen.getByText('Culture Article')).toBeInTheDocument();
      expect(screen.queryByText('News Article')).not.toBeInTheDocument();
      expect(screen.queryByText('Sports Article')).not.toBeInTheDocument();
    });

    it('should filter articles by search term', async () => {
      render(<NewsSection {...mockProps} searchTerm="Culture" />);

      await waitFor(() => {
        expect(screen.getByText('Culture Article')).toBeInTheDocument();
      });

      // Should only show articles matching search term
      expect(screen.getByText('Culture Article')).toBeInTheDocument();
      expect(screen.queryByText('News Article')).not.toBeInTheDocument();
      expect(screen.queryByText('Sports Article')).not.toBeInTheDocument();
    });

    it('should sort articles correctly', async () => {
      render(<NewsSection {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Culture Article')).toBeInTheDocument();
      });

      // Find sort dropdown
      const sortSelect = screen.getByLabelText('Sort Articles By');
      
      // Change to title ascending
      fireEvent.change(sortSelect, { target: { value: 'title-asc' } });

      // Articles should be sorted by title
      const articles = screen.getAllByRole('heading', { level: 3 });
      expect(articles[0]).toHaveTextContent('Culture Article');
      expect(articles[1]).toHaveTextContent('News Article');
      expect(articles[2]).toHaveTextContent('Sports Article');
    });
  });

  describe('User Interactions', () => {
    it('should call onReadMoreClick when article is clicked', async () => {
      const mockArticles = MockDataGenerators.createMockArticles(1);
      mockApiService.getArticles.mockResolvedValue(
        MockDataGenerators.createMockApiResponse(mockArticles)
      );

      render(<NewsSection {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Sample Article 1')).toBeInTheDocument();
      });

      // Click on article title
      fireEvent.click(screen.getByText('Sample Article 1'));

      expect(mockProps.onReadMoreClick).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sample Article 1',
        })
      );
    });

    it('should refresh articles when refresh button is clicked', async () => {
      const mockArticles = MockDataGenerators.createMockArticles(1);
      mockApiService.getArticles.mockResolvedValue(
        MockDataGenerators.createMockApiResponse(mockArticles)
      );

      render(<NewsSection {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Sample Article 1')).toBeInTheDocument();
      });

      // Click refresh button
      const refreshButton = screen.getByTitle('Refresh articles');
      fireEvent.click(refreshButton);

      // API should be called again
      expect(mockApiService.getArticles).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance', () => {
    it('should memoize filtered articles', async () => {
      const mockArticles = MockDataGenerators.createMockArticles(100);
      mockApiService.getArticles.mockResolvedValue(
        MockDataGenerators.createMockApiResponse(mockArticles)
      );

      const { rerender } = render(<NewsSection {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Sample Article 1')).toBeInTheDocument();
      });

      // Re-render with same props
      rerender(<NewsSection {...mockProps} />);

      // Filtering should be memoized (tested through performance monitoring)
      expect(mockApiService.getArticles).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      const mockArticles = MockDataGenerators.createMockArticles(1);
      mockApiService.getArticles.mockResolvedValue(
        MockDataGenerators.createMockApiResponse(mockArticles)
      );

      render(<NewsSection {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Sample Article 1')).toBeInTheDocument();
      });

      // Check for proper ARIA labels
      expect(screen.getByLabelText('Sort Articles By')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /news/i })).toBeInTheDocument();
      
      // Check for proper button labels
      const readMoreButton = screen.getByLabelText(/Read more about Sample Article 1/);
      expect(readMoreButton).toBeInTheDocument();
    });
  });
});
