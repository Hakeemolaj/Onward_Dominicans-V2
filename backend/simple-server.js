const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Sample data
const sampleArticles = [
  {
    id: 'news1',
    title: 'Community Unites for Annual River Cleanup Drive',
    date: 'October 26, 2024',
    summary: 'Hundreds of volunteers gathered last Saturday for the annual river cleanup, showcasing strong community spirit and environmental concern.',
    imageUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
    category: 'Community',
    status: 'PUBLISHED',
    author: {
      name: 'Maria Santos',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=60',
      bio: 'Maria Santos is a seasoned local reporter with a passion for community stories and environmental journalism.'
    },
    fullContent: `The annual City River Cleanup drive saw an unprecedented turnout last Saturday, with over 300 volunteers from all walks of life dedicating their morning to restore the waterway's natural beauty. Organized by the 'Friends of the River' local non-profit, the event aimed to remove accumulated trash and raise awareness about river pollution.

Participants, equipped with gloves and biodegradable bags, worked tirelessly along a two-mile stretch of the riverbank. Notable attendees included Mayor Johnson, several city council members, and student groups from local schools. Over 2 tons of garbage, predominantly plastics and non-biodegradable waste, were collected.

"It's heartwarming to see so many people care about our environment," said Jane Doe, lead organizer. "This collective effort not only cleans our river but also strengthens our community bonds." The event also featured educational booths on recycling and sustainable living. Organizers hope this momentum will lead to more consistent conservation efforts throughout the year.`,
    slug: 'community-unites-river-cleanup-2024',
    tags: ['environment', 'community', 'volunteering']
  },
  {
    id: 'news2',
    title: 'Local Library Launches Digital Literacy Program for Seniors',
    date: 'October 24, 2024',
    summary: 'The City Library has introduced a new program to help senior citizens enhance their digital skills, bridging the technology gap.',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
    category: 'Education',
    status: 'PUBLISHED',
    author: {
      name: 'John B. Good',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=60',
      bio: 'John B. Good focuses on educational developments and social programs.'
    },
    fullContent: `In an effort to empower senior citizens in the digital age, the City Public Library today launched its "Tech Savvy Seniors" program. This initiative offers free workshops on essential digital skills, including using smartphones, navigating the internet safely, social media basics, and online communication tools.

The program, funded by a grant from the Community Foundation, will run for six months with multiple sessions per week. "Our goal is to ensure our seniors are not left behind in this rapidly evolving digital world," stated Head Librarian, Ms. Emily Carter. "We want to help them connect with loved ones, access information, and utilize online services confidently."

The first workshop on "Smartphone Basics" was fully booked, indicating a strong interest from the community. Participants expressed enthusiasm and gratitude for the initiative. The library plans to expand the program based on initial feedback and demand, possibly including more advanced topics in the future.`,
    slug: 'library-digital-literacy-seniors-2024',
    tags: ['digital literacy', 'seniors', 'education', 'library']
  }
];

const sampleCategories = [
  { id: 'cat1', name: 'Community', slug: 'community', color: '#10B981' },
  { id: 'cat2', name: 'Education', slug: 'education', color: '#3B82F6' },
  { id: 'cat3', name: 'Youth & STEM', slug: 'youth-stem', color: '#8B5CF6' },
  { id: 'cat4', name: 'Local Government', slug: 'local-government', color: '#EF4444' },
  { id: 'cat5', name: 'Arts & Culture', slug: 'arts-culture', color: '#F59E0B' }
];

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Onward Dominicans API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: 'development',
      version: '1.0.0',
      services: {
        database: 'healthy',
        api: 'healthy',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Articles
app.get('/api/articles', (req, res) => {
  res.json({
    success: true,
    data: sampleArticles,
    meta: {
      total: sampleArticles.length,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    timestamp: new Date().toISOString(),
  });
});

// Single article
app.get('/api/articles/:id', (req, res) => {
  const article = sampleArticles.find(a => a.id === req.params.id || a.slug === req.params.id);
  if (!article) {
    return res.status(404).json({
      success: false,
      error: { message: 'Article not found' },
      timestamp: new Date().toISOString(),
    });
  }
  res.json({
    success: true,
    data: article,
    timestamp: new Date().toISOString(),
  });
});

// Categories
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: sampleCategories,
    timestamp: new Date().toISOString(),
  });
});

// Authors
app.get('/api/authors', (req, res) => {
  const authors = sampleArticles.map(a => a.author).filter((author, index, self) => 
    index === self.findIndex(a => a.name === author.name)
  );
  res.json({
    success: true,
    data: authors,
    timestamp: new Date().toISOString(),
  });
});

// Tags
app.get('/api/tags', (req, res) => {
  const allTags = sampleArticles.flatMap(a => a.tags || []);
  const uniqueTags = [...new Set(allTags)].map(tag => ({
    id: tag.toLowerCase().replace(/\s+/g, '-'),
    name: tag,
    slug: tag.toLowerCase().replace(/\s+/g, '-')
  }));
  res.json({
    success: true,
    data: uniqueTags,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      method: req.method,
    },
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: development`);
  console.log(`🌐 Frontend URL: http://localhost:5173`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Simple server started successfully`);
});

module.exports = app;
