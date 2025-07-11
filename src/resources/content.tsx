import { Logo } from "@once-ui-system/core";

const person = {
  firstName: "Dylan",
  lastName: "Hubert",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "Machine Learning Engineer & Full Stack Developer",
  avatar: "/images/avatar.jpg",
  email: "dylandhubert@outlook.com",
  location: "America/Los_Angeles", // Los Angeles timezone
  languages: ["English"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}&apos;s Newsletter</>,
  description: (
    <>
      I occasionally write about machine learning, full stack development, and share insights from my work at NASA and in the tech industry.
    </>
  ),
};

const social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/DylanDHubert",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/dylan-hubert-a6ba63310/",
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
];

const home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>Dylan Hubert</>,
  featured: {
    display: false,
  },

  subline: (
    <>
    Machine Learning Engineer & Full Stack Developer
    <br/>
    Building AI systems that bridge the gap between research and reality
    <br/>
    From NASA research to production RAG systems
    </>
  ),
};

const heroProjects = [
  {
    title: "MachInterview",
    subtitle: "Live Mock Interview AI Agent",
    href: "/websites/machinterview",
  },
  {
    title: "Eudaemonia",
    subtitle: "Personal Wellness Tracker",
    href: "/websites/eudaemonia-wellness",
  },
];

const about = {
  path: "/about",
  label: "ABOUT",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        Dylan is a Machine Learning Engineer and Full Stack Developer who transforms ideas into reality. His journey began with Python turtle graphics drawing polygons—a simple project that perfectly captured his core passion: creating things that bridge the gap between what&apos;s in his mind and tangible reality.
        <br/><br/>
        Mentored by Dr. Leah Ding at American University, Dylan deepened his love for machine learning and discovered his talent for building systems that matter. This foundation led to cutting-edge research at NASA and building production-ready RAG systems that handle real-world, messy data.
        <br/><br/>
        When not coding, Dylan creates art with markers and paper, produces music (self-taught), practices Taoist philosophy, and enjoys soccer, cycling, hiking, and baking bread. He believes in combining intellectual depth with practical impact, always seeking projects that are both technologically fascinating and genuinely useful.
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
      {
        company: "HHB AI Systems",
        timeframe: "06.01.2023 - Present",
        role: "Co-Founder, Machine Learning Engineering & Software Developer",
        achievements: [
          <>
            Developed PB&J (Peanut-Butter-Jelly) dynamic document processing pipeline using three-phase approach: parsing, betterment, and JSON transformation for complex technical PDFs.
          </>,
          <>
            Built Farm, a conversational RAG agent with multi-layered decision logic handling queries across various scales (full RAG, full context, chat context, limited tokens).
          </>,
          <>
            Implemented domain-agnostic system for highly technical, table-heavy PDFs with dynamic agents prioritizing data quality over processing speed.
          </>,
          <>
            Created specialized tools for table understanding, document navigation, and context management to enable agents to work with complex technical documentation.
          </>,
        ],
        images: [],
      },
      {
        company: "The Pitch Place",
        timeframe: "06.01.2023 - 02.01.2025",
        role: "Machine Learning Engineering & Software Developer",
        achievements: [
          <>
            Built semantic search system using both in-house (open source) and API models for journalist-editor matching platform, enabling content-based recommendations across writing style, formality, and topic preferences.
          </>,
          <>
            Developed RAG-based recommendation engine that connected pitches to appropriate journalists by analyzing content similarity, writing style (spin, formality), and editorial preferences.
          </>,
          <>
            Implemented full-stack solutions using Django, Next.js, and React for production deployment and user interface development of the Fiverr-like platform.
          </>,

        ],
        images: [],
      },
      {
        company: "NASA GSFC",
        timeframe: "01.01.2024 - 06.01.2024",
        role: "Machine Learning Intern (3D Cloud Reconstruction & Transfer Learning)",
        achievements: [
          <>
            Developed innovative 3D cloud reconstruction using perpendicular 2D views: GOES ABI top-down imagery + CloudSat side-view slices to predict atmospheric density profiles across entire regions.
          </>,
          <>
            Implemented M2M transformer architecture with Swin/ViT backbones and time/location embeddings for processing terabytes of satellite data on NASA supercomputers.
          </>,
          <>
            Created independent masking strategy for MAE/SATMAE pretraining, enabling cross-channel learning and improved transfer learning between MODIS (34-channel) and ABI (17-channel) satellite platforms.
          </>,
          <>
            Built comprehensive data pipeline handling metadata-based co-location, parallel preprocessing, and spectral channel alignment for multi-platform satellite data fusion.
          </>,
        ],
        images: [],
      },
      {
        company: "NASA GSFC",
        timeframe: "06.01.2023 - 08.01.2023",
        role: "Machine Learning Intern (Solar Physics & Time Series Forecasting)",
        achievements: [
          <>
            Developed CNN-Informer hybrid architecture for Total Solar Irradiance (TSI) prediction using HMI disk images, becoming the new baseline for the lab&apos;s solar physics research.
          </>,
          <>
            Designed computer vision preprocessing pipeline focusing on sunspots and faculae using Gaussian blurring, edge extraction, and temporal differencing for enhanced solar feature detection.
          </>,
          <>
            Implemented SSA signal preservation approach (using full decomposition vs. 3-component recombination) and learned PyTorch from scratch while building end-to-end pipeline for space weather forecasting.
          </>,
          <>
            Created 1024-dimensional CNN feature extraction with global pooling, concatenated with SSA sub-signals and statistical features for comprehensive solar-terrestrial relationship modeling.
          </>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Education",
    institutions: [
      {
        name: "American University, College of Arts & Sciences",
        description: <>Bachelor of Science in Computer Science (2021-2025). GPA: 3.82. Teaching Assistant for Introduction to Machine Learning & Computer Systems. Dean&apos;s List Six Semesters, Cum Laude. Mentored by Dr. Leah Ding, who recognized early talent and guided research trajectory. Conducted undergraduate research on Total Solar Irradiance (TSI) prediction using CNN-Informer hybrid architectures and computer vision preprocessing for solar physics applications. Later expanded to 3D cloud reconstruction using perpendicular 2D views and transfer learning across satellite platforms.</>,
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical Skills",
    skills: [
      {
        title: "Machine Learning & AI",
        description: <>PyTorch, TensorFlow, Keras, scikit-learn, Natural Language Processing & LLMs, RAG Systems, Semantic Search, Embeddings, Computer Vision, Time Series Forecasting, Transfer Learning, Self-Supervised Learning (MAE/SATMAE), CNN-Informer Architectures, M2M Transformers, Vision Transformers (Swin/ViT), Data Processing with NumPy, Pandas, Matplotlib, OpenCV, SciPy, Singular Spectrum Analysis (SSA).</>,
        images: [],
      },
      {
        title: "Full Stack Development",
        description: <>React, Next.js, Django, JavaScript, TypeScript, Tailwind CSS, Vercel deployment, Client-Server Communication, OOP, Dynamic Programming, Production System Design, API Development, User Interface Design.</>,
        images: [],
      },
      {
        title: "AI/ML Platforms & Tools",
        description: <>OpenAI API, LlamaIndex, HuggingFace, GitHub, Docker, CUDA, Linux, NASA Supercomputing Systems, Vector Databases, Dynamic Agent Architectures, Multi-layered Decision Systems, Recommendation Systems, Content-Based Filtering, Semantic Matching.</>,
        images: [],
      },
      {
        title: "Domain Expertise",
        description: <>Solar Physics & Space Weather Forecasting, Atmospheric Science & Cloud Modeling, Medical Device Documentation, Technical Document Processing, Satellite Data Analysis, Multi-spectral Imaging, Document Understanding & Information Retrieval, Journalism & Media Matching, Content Recommendation Systems, Conversational AI & Agentic Retrieval.</>,
        images: [],
      },
    ],
  },
  interests: {
    display: true, // set to false to hide this section
    title: "Interests",
    description: <>I play guitar daily, enjoy weekly soccer games with friends, hike local trails several times a week, and bake bread. I value routine and find that my creative energy flows naturally between work and personal interests. I appreciate Eastern philosophy, particularly the idea of stillness and letting life come without argument.</>,
  },
};

const blog = {
  path: "/blog",
  label: "BLOG",
  title: "Other Experience & Projects",
  description: `Additional experience and projects by ${person.name}`,
  // Create new posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work = {
  path: "/websites",
  label: "WEBSITES",
  title: `Websites – ${person.name}`,
  description: `Live web applications and projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/work/projects
  // All projects will be listed on the /home and /websites routes
};

const gallery = {
  path: "/gallery",
  label: "GALLERY",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  // Images by https://lorant.one
  // These are placeholder images, replace with your own
  images: [
    {
      src: "/images/gallery/ruins.jpeg",
      alt: "Ruins",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/factory.jpeg",
      alt: "Factory",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/twinpeaks.jpeg",
      alt: "Twin Peaks",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/opeanocean.jpeg",
      alt: "Ocean",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/palace.jpeg",
      alt: "Palace",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/theroom.jpeg",
      alt: "The Room",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/thetank.jpeg",
      alt: "The Tank",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/cactusisland.jpeg",
      alt: "Cactus Island",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/chinacampmarsh.jpeg",
      alt: "China Camp Marsh",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/balloons.jpeg",
      alt: "Balloons",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/sunsetocean.jpeg",
      alt: "Sunset Ocean",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/temple.jpeg",
      alt: "Temple",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/thething.jpeg",
      alt: "The Thing",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/thetankii.jpeg",
      alt: "The Tank II",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/seastacks.jpeg",
      alt: "Sea Stacks",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/searchlight.jpeg",
      alt: "Searchlight",
      orientation: "horizontal",
    },
  ],
};

const music = {
  path: "/music",
  label: "MUSIC",
  title: `Music Collection – ${person.name}`,
  description: `A curated collection of songs by ${person.name}`,
  songs: [
    {
      title: "000",
      artist: "Dylan Hubert",
      album: "carp.ets",
      date: "2024-01-15",
      cover: "/images/music/carpets.png",
      audioFile: "/audio/song-1.mp3",
    },
    {
      title: "Ocean Waves",
      artist: "Dylan Hubert",
      album: "Nature Sounds",
      date: "2024-02-20",
      cover: "/images/music/cover-2.jpg",
      audioFile: "/audio/song-2.mp3",
    },
    {
      title: "City Lights",
      artist: "Dylan Hubert",
      album: "Urban Vibes",
      date: "2024-03-10",
      cover: "/images/music/cover-3.jpg",
      audioFile: "/audio/song-3.mp3",
    },
    {
      title: "Mountain Echo",
      artist: "Dylan Hubert",
      album: "Adventure Tracks",
      date: "2024-04-05",
      cover: "/images/music/cover-4.jpg",
      audioFile: "/audio/song-4.mp3",
    },
    {
      title: "Desert Wind",
      artist: "Dylan Hubert",
      album: "Horizon",
      date: "2024-05-12",
      cover: "/images/music/cover-5.jpg",
      audioFile: "/audio/song-5.mp3",
    },
    {
      title: "Forest Whispers",
      artist: "Dylan Hubert",
      album: "Nature Sounds",
      date: "2024-06-18",
      cover: "/images/music/cover-6.jpg",
      audioFile: "/audio/song-6.mp3",
    },
    {
      title: "Rainy Day",
      artist: "Dylan Hubert",
      album: "Weather Patterns",
      date: "2024-07-22",
      cover: "/images/music/cover-7.jpg",
      audioFile: "/audio/song-7.mp3",
    },
    {
      title: "Sunset Drive",
      artist: "Dylan Hubert",
      album: "Road Trip",
      date: "2024-08-30",
      cover: "/images/music/cover-8.jpg",
      audioFile: "/audio/song-8.mp3",
    },
    {
      title: "Starry Night",
      artist: "Dylan Hubert",
      album: "Night Sessions",
      date: "2024-09-14",
      cover: "/images/music/cover-9.jpg",
      audioFile: "/audio/song-9.mp3",
    },
    {
      title: "Morning Coffee",
      artist: "Dylan Hubert",
      album: "Daily Rituals",
      date: "2024-10-08",
      cover: "/images/music/cover-10.jpg",
      audioFile: "/audio/song-10.mp3",
    },
    {
      title: "Electric Dreams",
      artist: "Dylan Hubert",
      album: "Digital Age",
      date: "2024-11-15",
      cover: "/images/music/cover-11.jpg",
      audioFile: "/audio/song-11.mp3",
    },
    {
      title: "Acoustic Soul",
      artist: "Dylan Hubert",
      album: "Unplugged",
      date: "2024-12-03",
      cover: "/images/music/cover-12.jpg",
      audioFile: "/audio/song-12.mp3",
    },
    {
      title: "Neon Lights",
      artist: "Dylan Hubert",
      album: "Urban Vibes",
      date: "2025-01-20",
      cover: "/images/music/cover-13.jpg",
      audioFile: "/audio/song-13.mp3",
    },
    {
      title: "Golden Hour",
      artist: "Dylan Hubert",
      album: "Photography",
      date: "2025-02-12",
      cover: "/images/music/cover-14.jpg",
      audioFile: "/audio/song-14.mp3",
    },
    {
      title: "Deep Blue",
      artist: "Dylan Hubert",
      album: "Ocean Depths",
      date: "2025-03-08",
      cover: "/images/music/cover-15.jpg",
      audioFile: "/audio/song-15.mp3",
    },
    {
      title: "Fireflies",
      artist: "Dylan Hubert",
      album: "Summer Nights",
      date: "2025-04-25",
      cover: "/images/music/cover-16.jpg",
      audioFile: "/audio/song-16.mp3",
    },
    {
      title: "Winter Chill",
      artist: "Dylan Hubert",
      album: "Seasonal",
      date: "2025-05-18",
      cover: "/images/music/cover-17.jpg",
      audioFile: "/audio/song-17.mp3",
    },
    {
      title: "Spring Bloom",
      artist: "Dylan Hubert",
      album: "Seasonal",
      date: "2025-06-30",
      cover: "/images/music/cover-18.jpg",
      audioFile: "/audio/song-18.mp3",
    },
    {
      title: "Autumn Leaves",
      artist: "Dylan Hubert",
      album: "Seasonal",
      date: "2025-07-14",
      cover: "/images/music/cover-19.jpg",
      audioFile: "/audio/song-19.mp3",
    },
    {
      title: "Summer Heat",
      artist: "Dylan Hubert",
      album: "Seasonal",
      date: "2025-08-22",
      cover: "/images/music/cover-20.jpg",
      audioFile: "/audio/song-20.mp3",
    },
    {
      title: "Crystal Clear",
      artist: "Dylan Hubert",
      album: "Pure",
      date: "2025-09-05",
      cover: "/images/music/cover-21.jpg",
      audioFile: "/audio/song-21.mp3",
    },
    {
      title: "Midnight Jazz",
      artist: "Dylan Hubert",
      album: "Jazz Collection",
      date: "2025-10-12",
      cover: "/images/music/cover-22.jpg",
      audioFile: "/audio/song-22.mp3",
    },
    {
      title: "Rock Anthem",
      artist: "Dylan Hubert",
      album: "Rock Classics",
      date: "2025-11-28",
      cover: "/images/music/cover-23.jpg",
      audioFile: "/audio/song-23.mp3",
    },
    {
      title: "Electronic Pulse",
      artist: "Dylan Hubert",
      album: "Digital Age",
      date: "2025-12-15",
      cover: "/images/music/cover-24.jpg",
      audioFile: "/audio/song-24.mp3",
    },
    {
      title: "Classical Harmony",
      artist: "Dylan Hubert",
      album: "Orchestral",
      date: "2026-01-10",
      cover: "/images/music/cover-25.jpg",
      audioFile: "/audio/song-25.mp3",
    },
  ],
};

const rag = {
  path: "/rag",
  label: "RAG",
  title: `RAG Chat – ${person.name}`,
  description: `Chat with an AI assistant that knows everything about ${person.name}&apos;s background, projects, and experience`,
};

export { person, social, newsletter, home, about, blog, work, gallery, music, rag, heroProjects };
