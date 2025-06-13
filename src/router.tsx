import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import ArticlePage from './pages/ArticlePage';
import NewsPage from './pages/NewsPage';
import CulturePage from './pages/CulturePage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';

// Article data - this will be fetched from your API in production
const ARTICLES = [
  {
    slug: 'celebrating-dominican-independence-day-2024',
    title: 'Celebrating Dominican Independence Day: A Community United',
    summary: 'Community members come together to celebrate Dominican Independence Day with traditional performances, food, and cultural activities.',
    content: `Every February 27th, Dominicans around the world come together to celebrate their independence from Haiti in 1844. This year's celebration promises to be particularly special as communities organize traditional events, cultural performances, and educational activities that honor our rich heritage.

## History of Dominican Independence

The Dominican Republic gained its independence on February 27, 1844, led by Juan Pablo Duarte and the secret society La Trinitaria. This historic moment marked the beginning of the Dominican Republic as a sovereign nation, free from Haitian rule that had lasted for 22 years.

## 2024 Celebration Events

This year's Independence Day celebrations feature:

- **Traditional Music and Dance**: Merengue and bachata performances by local artists
- **Culinary Festivals**: Featuring traditional Dominican dishes like mangu, sancocho, and tres golpes
- **Cultural Exhibitions**: Showcasing Dominican art, history, and traditions
- **Community Parades**: With participants wearing traditional costumes and carrying Dominican flags
- **Educational Programs**: Teaching younger generations about Dominican history and culture

## Community Unity

The celebration serves as more than just a historical commemoration—it's a time for the Dominican community to come together, strengthen bonds, and pass on cultural traditions to the next generation. Local organizations work tirelessly to organize events that bring families together and create lasting memories.

## Looking Forward

As we celebrate 180 years of independence, the Dominican community continues to grow and thrive while maintaining strong connections to our homeland and cultural roots. These celebrations remind us of our shared heritage and the importance of preserving our traditions for future generations.`,
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
    author: { name: 'Maria Rodriguez', bio: 'Cultural Affairs Correspondent' },
    date: '2024-02-27',
    category: 'Culture',
    tags: ['Dominican Independence Day', 'community celebration', 'cultural events']
  },
  {
    slug: 'traditional-mangu-family-recipe',
    title: 'The Art of Making Traditional Mangu: A Family Recipe',
    summary: 'Learn to make authentic Dominican mangu with this traditional family recipe passed down through generations.',
    content: `Mangu is more than just a dish—it's a cornerstone of Dominican cuisine and a symbol of our cultural identity. This traditional breakfast has been nourishing Dominican families for generations, and today we're sharing a cherished family recipe.

## What is Mangu?

Mangu is a traditional Dominican dish made primarily from mashed plantains, typically served for breakfast alongside eggs, cheese, and salami—a combination known as "Los Tres Golpes" (The Three Hits).

## Ingredients

- 6-8 green plantains, peeled and chopped
- 1 large onion, thinly sliced
- 3 cloves garlic, minced
- 3 tablespoons olive oil
- Salt to taste
- 1 cup water or chicken broth
- Optional: a splash of milk for creaminess

## Traditional Preparation Method

### Step 1: Prepare the Plantains
Peel and chop the plantains into 2-inch pieces. Place them in a pot with enough water to cover, add a pinch of salt, and bring to a boil.

### Step 2: Cook Until Tender
Boil the plantains for 15-20 minutes until they're fork-tender. The cooking time may vary depending on the ripeness of the plantains.

### Step 3: Prepare the Sofrito
While the plantains cook, heat olive oil in a large skillet over medium heat. Add the sliced onions and cook until golden and caramelized, about 8-10 minutes. Add minced garlic and cook for another minute.

### Step 4: Mash and Combine
Drain the plantains, reserving some cooking liquid. Mash the plantains until smooth, adding reserved liquid gradually to achieve your desired consistency. Fold in the caramelized onions and garlic.

### Step 5: Season and Serve
Season with salt to taste. Serve hot alongside fried eggs, cheese, and salami for the complete "Los Tres Golpes" experience.

## Family Tips and Variations

- **Consistency**: Some families prefer chunky mangu, while others like it completely smooth
- **Flavor boost**: Add a bay leaf while boiling the plantains for extra flavor
- **Modern twist**: Some cooks add a splash of coconut milk for richness
- **Leftover magic**: Leftover mangu can be formed into patties and fried for a delicious next-day treat

## Cultural Significance

Mangu represents the resourcefulness and creativity of Dominican cuisine. Born from simple, affordable ingredients, it became a beloved dish that transcends social and economic boundaries. Every Dominican family has their own variation, making each bowl a unique expression of family tradition.

This recipe has been passed down through four generations in our family, and we hope it brings the same warmth and satisfaction to your table that it has brought to ours.`,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    author: { name: 'Carmen Jimenez', bio: 'Culinary Heritage Specialist' },
    date: '2024-02-20',
    category: 'Food & Culture',
    tags: ['Dominican food', 'mangu recipe', 'traditional cooking']
  },
  {
    slug: 'youth-leadership-program-graduates-2024',
    title: 'Youth Leadership Program Graduates First Class',
    summary: 'The inaugural Dominican Youth Leadership Program celebrates its first graduating class of 25 young leaders.',
    content: `The Dominican Youth Leadership Program has reached a significant milestone with the graduation of its first class of 25 young leaders. This groundbreaking initiative, launched in early 2023, aims to develop the next generation of Dominican community leaders.

## Program Overview

The 12-month program combines leadership training, cultural education, and community service to prepare young Dominicans aged 16-25 for leadership roles in their communities. Participants engage in workshops, mentorship programs, and hands-on community projects.

## Curriculum Highlights

### Leadership Development
- Public speaking and communication skills
- Project management and organizational leadership
- Conflict resolution and mediation
- Financial literacy and entrepreneurship

### Cultural Education
- Dominican history and heritage
- Language preservation (Spanish and indigenous influences)
- Traditional arts and crafts
- Music and dance traditions

### Community Engagement
- Volunteer coordination
- Event planning and execution
- Fundraising and resource development
- Advocacy and civic participation

## Graduate Achievements

The graduating class has already made significant contributions to their communities:

- **Maria Santos** organized a cultural festival that attracted over 500 community members
- **Carlos Rodriguez** launched a tutoring program for elementary school students
- **Ana Perez** created a social media campaign promoting Dominican small businesses
- **Miguel Torres** coordinated a food drive that collected over 1,000 pounds of donations

## Mentorship Network

Each graduate was paired with established community leaders who provided guidance throughout the program. These mentors include business owners, educators, healthcare professionals, and civic leaders who continue to support the graduates as they pursue their goals.

## Future Plans

Based on the success of the inaugural class, the program is expanding to accommodate 50 participants in the next cohort. Plans are also underway to establish satellite programs in other cities with significant Dominican populations.

## Application Process

The next application cycle opens in March 2024. Interested candidates can apply online and must demonstrate:
- Commitment to community service
- Academic achievement or professional development
- Leadership potential
- Connection to Dominican culture and community

## Community Impact

The program has already generated significant community engagement, with graduates organizing monthly cultural events, establishing a community garden, and creating a scholarship fund for Dominican students pursuing higher education.

## Looking Ahead

As these young leaders continue their journey, they carry with them not only the skills and knowledge gained through the program but also a deep commitment to preserving and promoting Dominican culture while building bridges within the broader community.

The success of this first graduating class demonstrates the power of investing in young people and the bright future of Dominican leadership in our communities.`,
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
    author: { name: 'Roberto Fernandez', bio: 'Community Development Director' },
    date: '2024-02-15',
    category: 'Community',
    tags: ['youth leadership', 'Dominican youth', 'education', 'community development']
  },
  {
    slug: 'preserving-musical-heritage-merengue',
    title: 'Preserving Our Musical Heritage: The Sounds of Merengue',
    summary: 'Exploring the rich history and cultural significance of merengue music in Dominican culture and its evolution over time.',
    content: `Merengue is more than music—it's the heartbeat of Dominican culture. This vibrant genre has evolved from its humble beginnings in the 19th century to become one of the most recognizable sounds of the Caribbean, carrying with it the stories, struggles, and celebrations of the Dominican people.

## Origins and History

### Early Beginnings (1850s-1900s)
Merengue's roots trace back to the mid-19th century, emerging from a blend of African, European, and indigenous Taíno influences. The genre initially faced resistance from the upper classes, who considered it too crude and associated with the lower social strata.

### The Trujillo Era (1930s-1961)
Paradoxically, it was during Rafael Trujillo's dictatorship that merengue gained national prominence. Trujillo promoted the genre as a symbol of Dominican identity, leading to its widespread acceptance across all social classes.

### Modern Evolution (1960s-Present)
Post-Trujillo era saw merengue evolve and modernize, incorporating new instruments and influences while maintaining its distinctive rhythm and cultural significance.

## Musical Characteristics

### Traditional Instruments
- **Accordion (Acordeón)**: The lead melodic instrument
- **Tambora**: A two-headed drum providing the distinctive rhythm
- **Güira**: A metal scraper that adds percussive texture
- **Bass**: Added in modern arrangements for harmonic foundation

### Rhythm and Structure
Merengue is characterized by its fast-paced 2/4 time signature, creating an irresistible urge to dance. The basic rhythm pattern, known as "merengue típico," forms the foundation for countless variations and interpretations.

## Cultural Significance

### Social Commentary
Throughout its history, merengue has served as a vehicle for social commentary, with lyrics addressing everything from political issues to everyday life experiences. Artists have used the genre to tell stories of love, hardship, celebration, and social change.

### Community Bonding
Merengue serves as a unifying force in Dominican communities worldwide. Whether at family gatherings, community festivals, or national celebrations, the music brings people together across generational and social lines.

### Identity and Pride
For Dominicans living abroad, merengue serves as a powerful connection to their homeland, helping preserve cultural identity and pass traditions to younger generations.

## Legendary Artists

### Pioneers
- **Nico Lora**: Often credited as one of the fathers of modern merengue
- **Tatico Henríquez**: Helped popularize the genre in the mid-20th century
- **Joseíto Mateo**: Known as the "King of Merengue"

### Modern Masters
- **Johnny Ventura**: Revolutionized merengue with modern arrangements
- **Wilfrido Vargas**: Brought international recognition to the genre
- **Los Hermanos Rosario**: Contemporary masters keeping tradition alive

## Preservation Efforts

### Educational Programs
Music schools and cultural centers now offer formal merengue instruction, ensuring proper technique and historical knowledge are passed to new generations.

### Digital Archives
Organizations are working to digitize historical recordings and document the stories of merengue pioneers before this knowledge is lost.

### Cultural Festivals
Annual merengue festivals celebrate the genre while providing platforms for both traditional and contemporary artists.

## Global Influence

Merengue's influence extends far beyond Dominican borders:
- **Latin Music**: Influenced the development of other Latin genres
- **World Music**: Incorporated into fusion genres worldwide
- **Dance Culture**: Merengue dance is taught in studios globally
- **Cultural Diplomacy**: Serves as Dominican cultural ambassador internationally

## Challenges and Opportunities

### Modern Challenges
- Competition from newer musical genres
- Risk of commercialization diluting traditional elements
- Need for younger generation engagement

### Opportunities
- Digital platforms for global reach
- Fusion with contemporary genres
- Educational initiatives in schools
- International cultural exchange programs

## The Future of Merengue

As we look to the future, merengue continues to evolve while maintaining its essential character. Young artists are finding innovative ways to honor tradition while making the music relevant to contemporary audiences.

The key to preserving this musical heritage lies in balancing respect for tradition with openness to evolution, ensuring that merengue remains a living, breathing expression of Dominican culture for generations to come.

Through continued support for artists, educational programs, and cultural initiatives, we can ensure that the infectious rhythms and soulful melodies of merengue continue to unite and inspire Dominican communities worldwide.`,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    author: { name: 'Luis Morales', bio: 'Music Historian and Cultural Preservationist' },
    date: '2024-02-10',
    category: 'Music & Culture',
    tags: ['merengue music', 'Dominican culture', 'musical heritage', 'traditional music']
  }
];

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/news',
    element: <NewsPage />,
  },
  {
    path: '/culture',
    element: <CulturePage />,
  },
  {
    path: '/gallery',
    element: <GalleryPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/article/:slug',
    element: <ArticlePage />,
    loader: ({ params }) => {
      const article = ARTICLES.find(a => a.slug === params.slug);
      if (!article) {
        throw new Response('Article not found', { status: 404 });
      }
      return article;
    },
  },
]);

export { router, ARTICLES };
export default function Router() {
  return <RouterProvider router={router} />;
}
