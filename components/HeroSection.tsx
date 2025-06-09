
import React, { forwardRef } from 'react';
import { SectionId } from '../constants';
import { NewsArticle } from '../types';

interface HeroSectionProps {
  id: SectionId;
  article: NewsArticle | null; // Featured article
  onReadMoreClick: (article: NewsArticle) => void;
}

const HeroSection = forwardRef<HTMLDivElement, HeroSectionProps>((props, ref) => {
  const { article, onReadMoreClick } = props;

  if (!article) {
    return (
      <section ref={ref} id={props.id} className="bg-slate-700 dark:bg-slate-800 text-white py-20 text-center min-h-[60vh] flex items-center justify-center">
        <div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mb-4"></div>
          <p className="text-gray-300">Loading featured article...</p>
        </div>
      </section>
    );
  }

  const heroImageUrl = article.imageUrl || "https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"; // Generic news placeholder

  return (
    <section 
      ref={ref} 
      id={props.id} 
      className="relative bg-cover bg-center text-white"
      style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4)), url('${heroImageUrl}')` }} // Slightly lighter overlay for better dark image compatibility
      aria-labelledby="hero-article-title"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col justify-center min-h-[70vh] md:min-h-[60vh]">
        <div className="md:w-2/3 lg:w-1/2">
          {article.category && (
            <p className="text-sm font-semibold text-yellow-400 dark:text-yellow-300 uppercase tracking-wider mb-2 animate-fadeInUp animation-delay-100">
              {article.category}
            </p>
          )}
          <h1 id="hero-article-title" className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-shadow-md animate-fadeInUp animation-delay-300">
            {article.title}
          </h1>
          <div className="text-sm text-gray-200 dark:text-gray-300 mb-3 animate-fadeInUp animation-delay-500">
            By <span className="font-semibold">{article.author.name}</span> on {article.date}
          </div>
          <p className="text-md sm:text-lg text-gray-300 dark:text-gray-200 mb-6 leading-relaxed line-clamp-3 animate-fadeInUp animation-delay-600">
            {article.summary}
          </p>
          <div className="animate-fadeInUp animation-delay-700">
            <button 
              onClick={() => onReadMoreClick(article)}
              className="mt-2 px-8 py-3 bg-yellow-500 text-slate-900 font-semibold rounded-lg shadow-md hover:bg-yellow-400 dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-slate-900 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300 dark:focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-slate-900 dark:focus:ring-offset-black"
            >
              Read Full Story
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});

export default HeroSection;