
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
