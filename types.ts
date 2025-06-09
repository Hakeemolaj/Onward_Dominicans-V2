
import { SectionId } from './constants';

export interface NavLink {
  id: SectionId;
  label: string;
}

export interface SectionProps {
  id: SectionId;
  className?: string;
}

export interface Author {
  name: string;
  avatarUrl?: string;
  bio?: string; 
}

export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  summary: string;
  imageUrl?: string;
  category?: string;
  fullContent: string;
  author: Author;
  slug?: string;
  tags?: string[];
}

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category?: GalleryCategory;
  categoryId?: string;
  tags?: string[];
  photographer?: string;
  dateTaken?: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Stacking and grouping fields
  stackGroup?: string;
  stackOrder?: number;
  isStackCover?: boolean;
}

export interface GalleryStack {
  id: string;
  coverImage: GalleryItem;
  images: GalleryItem[];
  count: number;
  category?: GalleryCategory;
}

export interface SlideshowSettings {
  id: string;
  name: string;
  autoAdvance: boolean;
  intervalSeconds: number;
  showControls: boolean;
  showIndicators: boolean;
  enableFullscreen: boolean;
  transitionEffect: 'fade' | 'slide' | 'zoom';
  isActive: boolean;
  categoryId?: string;
  category?: GalleryCategory;
  createdAt: string;
  updatedAt: string;
}
