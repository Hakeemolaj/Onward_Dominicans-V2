
import React, { forwardRef, useMemo } from 'react';
import { SectionProps, Author } from '../types';
import { SAMPLE_NEWS_ARTICLES, PUBLICATION_NAME, SectionId } from '../constants';

const MeetTheTeamSection = forwardRef<HTMLDivElement, SectionProps>((props, ref) => {
  
  const uniqueAuthors: Author[] = useMemo(() => {
    const authorsMap = new Map<string, Author>();
    SAMPLE_NEWS_ARTICLES.forEach(article => {
      if (article.author && !authorsMap.has(article.author.name)) {
        authorsMap.set(article.author.name, article.author);
      }
    });
    return Array.from(authorsMap.values());
  }, []);

  return (
    <section 
      ref={ref} 
      id={props.id || SectionId.MEET_THE_TEAM} 
      className={`py-16 md:py-24 bg-white dark:bg-slate-900 ${props.className || ''}`}
      aria-labelledby="meet-the-team-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="meet-the-team-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 text-center mb-16">
          Meet Our Team at {PUBLICATION_NAME}
        </h2>
        
        {uniqueAuthors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {uniqueAuthors.map((author, index) => (
              <div 
                key={author.name + index} 
                className="bg-slate-50 dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 p-6 text-center flex flex-col items-center transform transition-all duration-300 hover:shadow-2xl dark:hover:shadow-slate-900/70 hover:-translate-y-1"
              >
                <img 
                  src={author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random&color=fff&size=128`} 
                  alt={`Photo of ${author.name}`} 
                  className="w-32 h-32 rounded-full mb-5 object-cover shadow-md border-4 border-white dark:border-slate-700"
                />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100 mb-1">
                  {author.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed min-h-[60px]">
                  {author.bio || 'Dedicated journalist contributing to our publication.'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-600 dark:text-slate-300 text-lg">
            Information about our talented team of journalists will be available soon.
          </p>
        )}
      </div>
    </section>
  );
});

export default MeetTheTeamSection;