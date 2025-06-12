
import React, { forwardRef, useState, useEffect } from 'react';
import { SectionProps, Author } from '../types';
import { PUBLICATION_NAME, SectionId } from '../constants';
import { apiService } from '../services/apiService';

const MeetTheTeamSection = forwardRef<HTMLDivElement, SectionProps>((props, ref) => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuthors = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Loading authors from backend...');

        const response = await apiService.getAuthors({
          limit: 20,
          sortBy: 'name',
          sortOrder: 'asc'
        });

        if (response.success && response.data) {
          const transformedAuthors: Author[] = response.data.map(author => ({
            name: author.name,
            avatarUrl: author.avatarUrl || undefined,
            bio: author.bio || 'Dedicated journalist contributing to our publication.',
            articleCount: author.articleCount || 0
          }));

          setAuthors(transformedAuthors);
          console.log(`✅ Loaded ${transformedAuthors.length} authors from backend`);
        } else {
          throw new Error(response.error?.message || 'Failed to load authors');
        }
      } catch (err) {
        console.error('❌ Error loading authors:', err);
        setError(err instanceof Error ? err.message : 'Failed to load authors');
        setAuthors([]);
      } finally {
        setLoading(false);
      }
    };

    loadAuthors();
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

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading our team...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">Error loading team: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : authors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {authors.map((author, index) => (
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
                <div className="mt-3 flex items-center justify-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    (author.articleCount || 0) > 0
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    📝 {author.articleCount || 0} article{(author.articleCount || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
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