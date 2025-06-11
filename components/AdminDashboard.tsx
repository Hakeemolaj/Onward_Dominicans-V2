import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

interface ArticleFormData {
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  authorId: string;
  categoryId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tags: string[];
}

interface AuthorFormData {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
}

interface GalleryItemFormData {
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  photographer: string;
  location: string;
  categoryId: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [articles, setArticles] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [galleryCategories, setGalleryCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [articleForm, setArticleForm] = useState<ArticleFormData>({
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    authorId: '',
    categoryId: '',
    status: 'DRAFT',
    tags: []
  });

  const [authorForm, setAuthorForm] = useState<AuthorFormData>({
    name: '',
    email: '',
    bio: '',
    avatarUrl: ''
  });

  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const [galleryForm, setGalleryForm] = useState<GalleryItemFormData>({
    title: '',
    description: '',
    imageUrl: '',
    thumbnailUrl: '',
    photographer: '',
    location: '',
    categoryId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [articlesRes, authorsRes, categoriesRes] = await Promise.all([
        apiService.getArticles(),
        apiService.getAuthors(),
        apiService.getCategories(),
      ]);

      if (articlesRes.success) setArticles(articlesRes.data || []);
      if (authorsRes.success) setAuthors(authorsRes.data || []);
      if (categoriesRes.success) setCategories(categoriesRes.data || []);

      // Fetch gallery data
      try {
        const [galleryRes, galleryCatRes] = await Promise.all([
          fetch('http://localhost:3001/api/gallery'),
          fetch('http://localhost:3001/api/gallery-categories')
        ]);

        if (galleryRes.ok && galleryCatRes.ok) {
          const galleryData = await galleryRes.json();
          const galleryCatData = await galleryCatRes.json();

          if (galleryData.success) setGalleryItems(galleryData.data || []);
          if (galleryCatData.success) setGalleryCategories(galleryCatData.data || []);
        }
      } catch (galleryError) {
        console.log('Gallery data not available:', galleryError);
      }
    } catch (error) {
      showNotification('error', 'Failed to fetch data');
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Reset form functions
  const resetArticleForm = () => {
    setArticleForm({
      title: '',
      summary: '',
      content: '',
      imageUrl: '',
      authorId: '',
      categoryId: '',
      status: 'DRAFT',
      tags: []
    });
    setEditingItem(null);
  };

  const resetAuthorForm = () => {
    setAuthorForm({
      name: '',
      email: '',
      bio: '',
      avatarUrl: ''
    });
    setEditingItem(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      color: '#3B82F6'
    });
    setEditingItem(null);
  };

  const resetGalleryForm = () => {
    setGalleryForm({
      title: '',
      description: '',
      imageUrl: '',
      thumbnailUrl: '',
      photographer: '',
      location: '',
      categoryId: ''
    });
    setEditingItem(null);
  };

  // Article CRUD operations
  const handleCreateArticle = () => {
    resetArticleForm();
    setShowArticleModal(true);
  };

  const handleEditArticle = (article: any) => {
    setEditingItem(article);
    setArticleForm({
      title: article.title || '',
      summary: article.summary || '',
      content: article.content || '',
      imageUrl: article.imageUrl || '',
      authorId: article.authorId || '',
      categoryId: article.categoryId || '',
      status: article.status || 'DRAFT',
      tags: article.tags?.map((tag: any) => tag.name) || []
    });
    setShowArticleModal(true);
  };

  const handleSaveArticle = async () => {
    try {
      const response = editingItem
        ? await apiService.updateArticle(editingItem.id, articleForm)
        : await apiService.createArticle(articleForm);

      if (response.success) {
        showNotification('success', `Article ${editingItem ? 'updated' : 'created'} successfully`);
        setShowArticleModal(false);
        resetArticleForm();
        fetchData();
      } else {
        showNotification('error', response.error?.message || 'Failed to save article');
      }
    } catch (error) {
      showNotification('error', 'Error saving article');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await apiService.deleteArticle(id);
      if (response.success) {
        setArticles(articles.filter(article => article.id !== id));
        showNotification('success', 'Article deleted successfully');
      } else {
        showNotification('error', response.error?.message || 'Failed to delete article');
      }
    } catch (error) {
      showNotification('error', 'Error deleting article');
    }
  };

  // Author CRUD operations
  const handleCreateAuthor = () => {
    resetAuthorForm();
    setShowAuthorModal(true);
  };

  const handleEditAuthor = (author: any) => {
    setEditingItem(author);
    setAuthorForm({
      name: author.name || '',
      email: author.email || '',
      bio: author.bio || '',
      avatarUrl: author.avatarUrl || ''
    });
    setShowAuthorModal(true);
  };

  const handleSaveAuthor = async () => {
    try {
      const response = editingItem
        ? await apiService.updateAuthor(editingItem.id, authorForm)
        : await apiService.createAuthor(authorForm);

      if (response.success) {
        showNotification('success', `Author ${editingItem ? 'updated' : 'created'} successfully`);
        setShowAuthorModal(false);
        resetAuthorForm();
        fetchData();
      } else {
        showNotification('error', response.error?.message || 'Failed to save author');
      }
    } catch (error) {
      showNotification('error', 'Error saving author');
    }
  };

  // Category CRUD operations
  const handleCreateCategory = () => {
    resetCategoryForm();
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingItem(category);
    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
      color: category.color || '#3B82F6'
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      const response = editingItem
        ? await apiService.updateCategory(editingItem.id, categoryForm)
        : await apiService.createCategory(categoryForm);

      if (response.success) {
        showNotification('success', `Category ${editingItem ? 'updated' : 'created'} successfully`);
        setShowCategoryModal(false);
        resetCategoryForm();
        fetchData();
      } else {
        showNotification('error', response.error?.message || 'Failed to save category');
      }
    } catch (error) {
      showNotification('error', 'Error saving category');
    }
  };

  const handleSetFeaturedArticle = async (id: string) => {
    try {
      const response = await apiService.setFeaturedArticle(id);
      if (response.success) {
        showNotification('success', 'Article set as featured');
        fetchData(); // Refresh data
      }
    } catch (error) {
      showNotification('error', 'Error setting featured article');
    }
  };

  // Filter articles based on search and status
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalArticles: articles.length,
    publishedArticles: articles.filter(a => a.status === 'PUBLISHED').length,
    draftArticles: articles.filter(a => a.status === 'DRAFT').length,
    totalAuthors: authors.length,
    totalCategories: categories.length,
    recentArticles: articles
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'articles', name: 'Articles', count: articles.length, icon: '📰' },
    { id: 'gallery', name: 'Gallery', count: galleryItems.length, icon: '🖼️' },
    { id: 'authors', name: 'Authors', count: authors.length, icon: '👥' },
    { id: 'categories', name: 'Categories', count: categories.length, icon: '🏷️' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  🏛️ Admin Dashboard
                </h1>
              </div>
              <div className="ml-6">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Welcome back, <span className="font-medium">{user.firstName} {user.lastName}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  {user.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <span className="mr-2">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
                {tab.count !== undefined && (
                  <span className="ml-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">📰</span>
                      </div>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                          Total Articles
                        </dt>
                        <dd className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {stats.totalArticles}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {stats.publishedArticles} published
                      </span>
                      <span className="mx-2">•</span>
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                        {stats.draftArticles} drafts
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">👥</span>
                      </div>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                          Authors
                        </dt>
                        <dd className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {stats.totalAuthors}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">🏷️</span>
                      </div>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                          Categories
                        </dt>
                        <dd className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {stats.totalCategories}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">📊</span>
                      </div>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                          Published Rate
                        </dt>
                        <dd className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {stats.totalArticles > 0 ? Math.round((stats.publishedArticles / stats.totalArticles) * 100) : 0}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Management */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400">🔍</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="all">All Status</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <button
                    onClick={handleCreateArticle}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <span className="mr-2">✏️</span>
                    New Article
                  </button>
                </div>
              </div>
            </div>

            {/* Articles List */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Articles ({filteredArticles.length})
                </h3>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <div key={article.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 truncate">
                              {article.title}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              article.status === 'PUBLISHED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : article.status === 'DRAFT'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {article.status}
                            </span>
                          </div>
                          <p className="mt-2 text-slate-600 dark:text-slate-400 line-clamp-2">
                            {article.summary}
                          </p>
                          <div className="mt-3 flex items-center text-sm text-slate-500 dark:text-slate-400 space-x-4">
                            {article.author && (
                              <span className="flex items-center">
                                <span className="mr-1">👤</span>
                                {article.author.name}
                              </span>
                            )}
                            {article.category && (
                              <span className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-1"
                                  style={{ backgroundColor: article.category.color }}
                                ></div>
                                {article.category.name}
                              </span>
                            )}
                            <span className="flex items-center">
                              <span className="mr-1">📅</span>
                              {new Date(article.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEditArticle(article)}
                            className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          >
                            <span className="mr-1">✏️</span>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-600 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <span className="mr-1">🗑️</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="text-slate-400 dark:text-slate-500 text-6xl mb-4">📰</div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      {searchTerm || statusFilter !== 'all' ? 'No articles found' : 'No articles yet'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Get started by creating your first article'
                      }
                    </p>
                    {(!searchTerm && statusFilter === 'all') && (
                      <button
                        onClick={handleCreateArticle}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                      >
                        <span className="mr-2">✏️</span>
                        Create Your First Article
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gallery Management */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {/* Gallery Items */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Gallery Items ({galleryItems.length})
                  </h3>
                  <button
                    onClick={() => alert('Add gallery item feature coming soon!')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <span className="mr-2">🖼️</span>
                    Add Image
                  </button>
                </div>
              </div>
              <div className="p-6">
                {galleryItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {galleryItems.map((item) => (
                      <div key={item.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
                        <div className="aspect-w-16 aspect-h-12">
                          <img
                            src={item.thumbnailUrl || item.imageUrl}
                            alt={item.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate mb-2">
                            {item.title}
                          </h4>
                          {item.category && (
                            <div className="flex items-center mb-2">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: item.category.color }}
                              ></div>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {item.category.name}
                              </span>
                            </div>
                          )}
                          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                            {item.photographer && (
                              <p>📸 {item.photographer}</p>
                            )}
                            {item.location && (
                              <p>📍 {item.location}</p>
                            )}
                            <p>📅 {new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="mt-3 flex space-x-2">
                            <button
                              onClick={() => alert('Edit gallery item feature coming soon!')}
                              className="flex-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => alert('Delete gallery item feature coming soon!')}
                              className="flex-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-slate-400 dark:text-slate-500 text-6xl mb-4">🖼️</div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      No gallery items yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      Get started by adding your first image to the gallery
                    </p>
                    <button
                      onClick={() => alert('Add gallery item feature coming soon!')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <span className="mr-2">🖼️</span>
                      Add Your First Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Categories */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Gallery Categories ({galleryCategories.length})
                  </h3>
                  <button
                    onClick={() => alert('Add gallery category feature coming soon!')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <span className="mr-2">🏷️</span>
                    Add Category
                  </button>
                </div>
              </div>
              <div className="p-6">
                {galleryCategories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleryCategories.map((category) => (
                      <div key={category.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-6 h-6 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 truncate">
                              {category.name}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              /{category.slug}
                            </p>
                          </div>
                        </div>
                        {category.description && (
                          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                            {category.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>
                            {category._count?.galleryItems || 0} items
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => alert('Edit gallery category feature coming soon!')}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-slate-400 dark:text-slate-500 text-4xl mb-4">🏷️</div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      No gallery categories yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Create categories to organize your gallery items
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Authors Management */}
        {activeTab === 'authors' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Authors ({authors.length})
                  </h3>
                  <button
                    onClick={handleCreateAuthor}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <span className="mr-2">👤</span>
                    Add Author
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {authors.map((author) => (
                    <div key={author.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center space-x-4">
                        {author.avatarUrl ? (
                          <img
                            src={author.avatarUrl}
                            alt={author.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
                            <span className="text-slate-600 dark:text-slate-300 text-lg">👤</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 truncate">
                            {author.name}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {author.email}
                          </p>
                        </div>
                      </div>
                      {author.bio && (
                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                          {author.bio}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Joined {new Date(author.createdAt).toLocaleDateString()}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditAuthor(author)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Management */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Categories ({categories.length})
                  </h3>
                  <button
                    onClick={handleCreateCategory}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <span className="mr-2">🏷️</span>
                    Add Category
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 truncate">
                            {category.name}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            /{category.slug}
                          </p>
                        </div>
                      </div>
                      {category.description && (
                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                          {category.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Created {new Date(category.createdAt).toLocaleDateString()}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Settings</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">System Information</h4>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="font-medium text-slate-500 dark:text-slate-400">User Role</dt>
                          <dd className="text-slate-900 dark:text-slate-100">{user.role}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-500 dark:text-slate-400">Email</dt>
                          <dd className="text-slate-900 dark:text-slate-100">{user.email}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-500 dark:text-slate-400">Username</dt>
                          <dd className="text-slate-900 dark:text-slate-100">{user.username}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-500 dark:text-slate-400">Full Name</dt>
                          <dd className="text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                      <button
                        onClick={fetchData}
                        className="w-full md:w-auto inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                      >
                        <span className="mr-2">🔄</span>
                        Refresh Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Article Modal */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                {editingItem ? 'Edit Article' : 'Create New Article'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Enter article title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Summary
                </label>
                <textarea
                  value={articleForm.summary}
                  onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Enter article summary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Content
                </label>
                <textarea
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Enter article content"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Author
                  </label>
                  <select
                    value={articleForm.authorId}
                    onChange={(e) => setArticleForm({ ...articleForm, authorId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select an author</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={articleForm.categoryId}
                    onChange={(e) => setArticleForm({ ...articleForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={articleForm.status}
                    onChange={(e) => setArticleForm({ ...articleForm, status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={articleForm.imageUrl}
                    onChange={(e) => setArticleForm({ ...articleForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowArticleModal(false);
                  resetArticleForm();
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveArticle}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
              >
                {editingItem ? 'Update' : 'Create'} Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Author Modal */}
      {showAuthorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-lg w-full">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                {editingItem ? 'Edit Author' : 'Create New Author'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={authorForm.name}
                  onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Enter author name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={authorForm.email}
                  onChange={(e) => setAuthorForm({ ...authorForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="author@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={authorForm.bio}
                  onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Enter author bio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={authorForm.avatarUrl}
                  onChange={(e) => setAuthorForm({ ...authorForm, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAuthorModal(false);
                  resetAuthorForm();
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAuthor}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                {editingItem ? 'Update' : 'Create'} Author
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-lg w-full">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                {editingItem ? 'Edit Category' : 'Create New Category'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Enter category description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-12 h-10 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                  <input
                    type="text"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  resetCategoryForm();
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                {editingItem ? 'Update' : 'Create'} Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
