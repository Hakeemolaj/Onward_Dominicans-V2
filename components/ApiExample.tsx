import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

// Example component showing how to integrate with the new backend API
const ApiExample: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    setIsAuthenticated(apiService.isAuthenticated());
  }, []);

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await apiService.getArticles({
          status: 'PUBLISHED',
          limit: 5,
          sortBy: 'publishedAt',
          sortOrder: 'desc'
        });

        if (response.success) {
          setArticles(response.data || []);
        } else {
          setError(response.error?.message || 'Failed to fetch articles');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Login example
  const handleLogin = async () => {
    try {
      const response = await apiService.login(
        'admin@onwarddominicans.news',
        'admin123'
      );

      if (response.success) {
        setIsAuthenticated(true);
        alert('Login successful!');
      } else {
        alert('Login failed: ' + response.error?.message);
      }
    } catch (err) {
      alert('Login error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Logout example
  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    alert('Logged out successfully!');
  };

  // Health check example
  const checkHealth = async () => {
    try {
      const response = await apiService.healthCheck();
      if (response.success) {
        alert('Backend is healthy! ✅');
      } else {
        alert('Backend health check failed: ' + response.error?.message);
      }
    } catch (err) {
      alert('Health check error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
          API Integration Example
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <span className="ml-2 text-slate-600 dark:text-slate-400">Loading articles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
        API Integration Example
      </h2>

      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">
          Authentication Status
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-3">
          Status: {isAuthenticated ? (
            <span className="text-green-600 dark:text-green-400 font-semibold">✅ Authenticated</span>
          ) : (
            <span className="text-red-600 dark:text-red-400 font-semibold">❌ Not Authenticated</span>
          )}
        </p>
        <div className="space-x-2">
          {!isAuthenticated ? (
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Login as Admin
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          )}
          <button
            onClick={checkHealth}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Check Backend Health
          </button>
        </div>
      </div>

      {/* Articles from API */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">
          Articles from Backend API
        </h3>
        
        {error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">
              Error: {error}
            </p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-1">
              Make sure the backend is running on http://localhost:3001
            </p>
          </div>
        ) : articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg"
              >
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  {article.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                  {article.summary}
                </p>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-500 space-x-4">
                  <span>By: {article.author?.name}</span>
                  <span>Category: {article.category?.name || 'Uncategorized'}</span>
                  <span>Status: {article.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-600 dark:text-yellow-400">
              No articles found. Try running the database seed command:
            </p>
            <code className="block mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-sm">
              cd backend && npm run db:seed
            </code>
          </div>
        )}
      </div>

      {/* API Information */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">
          API Information
        </h3>
        <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
          <p><strong>Backend URL:</strong> http://localhost:3001</p>
          <p><strong>API Base:</strong> http://localhost:3001/api</p>
          <p><strong>Health Check:</strong> <a href="http://localhost:3001/api/health" target="_blank" rel="noopener noreferrer" className="underline">http://localhost:3001/api/health</a></p>
          <p><strong>Articles Endpoint:</strong> <a href="http://localhost:3001/api/articles" target="_blank" rel="noopener noreferrer" className="underline">http://localhost:3001/api/articles</a></p>
        </div>
      </div>
    </div>
  );
};

export default ApiExample;
