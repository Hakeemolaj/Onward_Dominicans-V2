
import React from 'react';

interface SocialShareButtonsProps {
  articleUrl: string;
  articleTitle: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ articleUrl, articleTitle }) => {
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(articleTitle);

  const shareLinks = [
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
    },
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
      bgColor: 'bg-sky-500 hover:bg-sky-600 dark:bg-sky-400 dark:hover:bg-sky-500',
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      bgColor: 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700',
    },
    {
      name: 'Email',
      url: `mailto:?subject=${encodedTitle}&body=Check out this article: ${encodedUrl}`,
      icon: (
         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
          </svg>
      ),
      bgColor: 'bg-slate-500 hover:bg-slate-600 dark:bg-slate-400 dark:hover:bg-slate-500',
    }
  ];

  return (
    <div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Share this article:</p>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map(link => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center px-4 py-2 text-white text-xs font-medium rounded-md shadow-sm transition-colors duration-150 ${link.bgColor}`}
            aria-label={`Share on ${link.name}`}
          >
            {link.icon}
            <span className="ml-2 hidden sm:inline">{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialShareButtons;