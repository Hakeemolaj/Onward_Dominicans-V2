
export const APP_NAME_PART1 = "ONWARD";
export const APP_NAME_PART2 = "DOMINICANS";
export const PUBLICATION_NAME = `${APP_NAME_PART1} ${APP_NAME_PART2}`;
export const PUBLICATION_MISSION = "Delivering insightful news and stories that matter to our community, with integrity and passion. We aim to inform, engage, and inspire through quality journalism.";
export const PUBLICATION_CONTACT_EMAIL = "editor@onwarddominicans.news";
export const PUBLICATION_COPYRIGHT_STATEMENT = `© ${new Date().getFullYear()} ${PUBLICATION_NAME}. All Rights Reserved.`;

export const ALL_NEWS_URL = "/archive";

export enum SectionId {
  HOME = "home",
  NEWS_FEED = "news-feed",
  GALLERY = "gallery",
  ABOUT_PUBLICATION = "about-publication",
  MEET_THE_TEAM = "meet-the-team",
  CONTACT_US = "contact-us" // Removed trailing comma here
}

export const NAV_LINKS = [
  { id: SectionId.HOME, label: "Home" },
  { id: SectionId.NEWS_FEED, label: "All News"},
  { id: SectionId.GALLERY, label: "Gallery" },
  { id: SectionId.ABOUT_PUBLICATION, label: "About Us" },
  { id: SectionId.MEET_THE_TEAM, label: "Our Team" },
  { id: SectionId.CONTACT_US, label: "Contact" },
];

export const AI_EDITOR_SYSTEM_INSTRUCTION = `You are a helpful and concise AI assistant for '${PUBLICATION_NAME}', a community news publication. Our publication's mission is: "${PUBLICATION_MISSION}". Your role is to answer user questions about:
1. How to submit news tips or story ideas.
2. General inquiries about our publication's work and focus.
3. Basic journalistic practices or ethics relevant to a community paper.
4. Information about our contact details (which is ${PUBLICATION_CONTACT_EMAIL}).

If a question falls outside these topics (e.g., asking for news summaries, personal opinions, or complex off-topic subjects), politely state that you can assist with questions about the publication itself and how to interact with it. Keep responses informative, friendly, and brief (1-3 sentences if possible). Do not make up information if you don't know the answer for a relevant topic; instead, suggest contacting ${PUBLICATION_CONTACT_EMAIL} directly.`;

export const AI_SUMMARY_SYSTEM_INSTRUCTION = `You are a helpful AI assistant. Summarize the following news article content into a concise TL;DR (Too Long; Didn't Read) format. The summary should be 2-3 sentences and capture the main points and key takeaways of the article.`;


export const SAMPLE_NEWS_ARTICLES = [
  {
    id: 'news1',
    title: 'Community Unites for Annual River Cleanup Drive',
    date: 'October 26, 2024',
    summary: 'Hundreds of volunteers gathered last Saturday for the annual river cleanup, showcasing strong community spirit and environmental concern.',
    imageUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
    category: 'Community',
    author: {
      name: 'Maria Santos',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=60',
      bio: 'Maria Santos is a seasoned local reporter with a passion for community stories and environmental journalism. She has been with Onward Dominicans for 5 years.'
    },
    fullContent: `The annual City River Cleanup drive saw an unprecedented turnout last Saturday, with over 300 volunteers from all walks of life dedicating their morning to restore the waterway's natural beauty. Organized by the 'Friends of the River' local non-profit, the event aimed to remove accumulated trash and raise awareness about river pollution.\n\nParticipants, equipped with gloves and biodegradable bags, worked tirelessly along a two-mile stretch of the riverbank. Notable attendees included Mayor Johnson, several city council members, and student groups from local schools. Over 2 tons of garbage, predominantly plastics and non-biodegradable waste, were collected.\n\n"It's heartwarming to see so many people care about our environment," said Jane Doe, lead organizer. "This collective effort not only cleans our river but also strengthens our community bonds." The event also featured educational booths on recycling and sustainable living. Organizers hope this momentum will lead to more consistent conservation efforts throughout the year.`,
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
    author: {
      name: 'John B. Good',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=60',
      bio: 'John B. Good focuses on educational developments and social programs. He believes in empowering the community through knowledge and access to resources.'
    },
    fullContent: `In an effort to empower senior citizens in the digital age, the City Public Library today launched its "Tech Savvy Seniors" program. This initiative offers free workshops on essential digital skills, including using smartphones, navigating the internet safely, social media basics, and online communication tools.\n\n The program, funded by a grant from the Community Foundation, will run for six months with multiple sessions per week. "Our goal is to ensure our seniors are not left behind in this rapidly evolving digital world," stated Head Librarian, Ms. Emily Carter. "We want to help them connect with loved ones, access information, and utilize online services confidently."\n\nThe first workshop on "Smartphone Basics" was fully booked, indicating a strong interest from the community. Participants expressed enthusiasm and gratitude for the initiative. The library plans to expand the program based on initial feedback and demand, possibly including more advanced topics in the future.`,
    slug: 'library-digital-literacy-seniors-2024',
    tags: ['digital literacy', 'seniors', 'education', 'library']
  },
  {
    id: 'news3',
    title: 'High School Robotics Team Heads to National Championship',
    date: 'October 22, 2024',
    summary: 'The Northwood High School "RoboKnights" have secured their spot in the upcoming National Robotics Championship after a stunning regional victory.',
    imageUrl: 'https://images.unsplash.com/photo-1666870428593-304rcc624f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
    category: 'Youth & STEM',
    author: {
      name: 'Alex Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=60',
      bio: 'Alex Chen covers youth achievements, technology, and STEM innovations. A tech enthusiast, Alex brings a fresh perspective to stories of young innovators.'
    },
    fullContent: `The Northwood High School robotics team, the "RoboKnights," are celebrating a significant achievement after clinching first place at the State Robotics Qualifiers last weekend. Their innovative robot, "Titan," impressed judges with its agility, precision, and problem-solving capabilities in a series of complex challenges.\n\nThis victory earns them a coveted spot at the National Robotics Championship to be held in Chicago next month. Team captain, Sarah Miller, a senior at Northwood, shared her excitement: "We've worked incredibly hard all year, and it's amazing to see our dedication pay off. We're ready to represent our school and state at the nationals."\n\nFaculty advisor, Mr. David Lee, praised the team's teamwork and technical skills. "These students are not just building robots; they're building futures in STEM," he said. The team is now fundraising to cover travel expenses for the national competition.`,
    slug: 'northwood-robotics-nationals-2024',
    tags: ['robotics', 'STEM', 'high school', 'competition']
  },
  {
    id: 'news4',
    title: 'City Council Approves New Downtown Revitalization Plan',
    date: 'October 20, 2024',
    summary: 'A comprehensive plan to revitalize the city\'s downtown core, focusing on pedestrian-friendly spaces and support for local businesses, received unanimous approval.',
    imageUrl: 'https://images.unsplash.com/photo-1549976240-3a7e872a3c80?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
    category: 'Local Government',
    author: {
      name: 'Maria Santos',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=60',
      bio: 'Maria Santos is a seasoned local reporter with a passion for community stories and environmental journalism. She has been with Onward Dominicans for 5 years.'
    },
    fullContent: `The City Council unanimously approved the "Downtown Forward" revitalization plan during Tuesday night's session. The multi-phase project aims to transform the city center into a vibrant hub with enhanced public spaces, improved infrastructure, and incentives for local businesses.\n\nKey features of the plan include the creation of new pedestrian plazas, expanded bike lanes, modernized street lighting, and a facade improvement grant program for historic buildings. "This is a landmark decision for our city," Mayor Johnson stated. "A thriving downtown benefits everyone, creating jobs, boosting tourism, and fostering a stronger sense of community."\n\nFunding for the initial phase, estimated at $5 million, will come from a combination of city bonds and state grants. Construction is expected to begin in early next year. Public consultations will be held to gather community input on specific design elements.`,
    slug: 'downtown-revitalization-plan-approved-2024',
    tags: ['local government', 'urban planning', 'business', 'community development']
  },
  {
    id: 'news5',
    title: 'Annual Arts Festival Showcases Diverse Local Talent',
    date: 'October 18, 2024',
    summary: 'The City Arts Festival returned this weekend, drawing large crowds and highlighting the rich cultural tapestry of our community.',
    imageUrl: 'https://images.unsplash.com/photo-1534270804123-485485082a21?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
    category: 'Arts & Culture',
    author: {
      name: 'John B. Good',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=60',
      bio: 'John B. Good focuses on educational developments and social programs. He believes in empowering the community through knowledge and access to resources.'
    },
    fullContent: `This past weekend, the heart of our city pulsed with creativity as the Annual Arts Festival made its vibrant return. Thousands of residents and visitors flocked to Central Park to experience a diverse array of artistic expressions, from live music and dance performances to visual art exhibitions and interactive workshops.\n\nLocal artists were the stars of the show, with over 50 booths displaying paintings, sculptures, photography, and handmade crafts. Food vendors offered a taste of global cuisines, adding to the festive atmosphere. "The festival is a testament to the incredible talent we have right here in our community," said festival director, Laura Chen. "It's a celebration of creativity, diversity, and the power of art to bring people together."\n\nThe event also featured a special "Young Artists" pavilion, showcasing work from students in local schools. Organizers hailed this year's festival as a major success and are already planning for an even bigger event next year.`,
    slug: 'annual-arts-festival-2024',
    tags: ['arts', 'culture', 'festival', 'community', 'local talent']
  }
];
