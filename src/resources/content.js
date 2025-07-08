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
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
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
    title: "machinterview",
    subtitle: "Live Mock Interview AI Agent",
    href: "/websites/machinterview",
  },
  {
    title: "eudaemonia",
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
        Dylan is a Machine Learning Engineer and Full Stack Developer who transforms ideas into reality. His journey began with Python turtle graphics drawing polygons—a simple project that perfectly captured his core passion: creating things that bridge the gap between what's in his mind and tangible reality.
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
        company: "Stryker MedTech",
        timeframe: "05.01.2025 - Present",
        role: "ML Engineer & Full Stack Developer (Contract/Freelance)",
        achievements: [
          <>
            Built an internal Retrieval-Augmented Generation (RAG) chatbot to search and summarize highly technical orthopedic implant documentation.
          </>,
          <>
            Integrated PDF highlighting, vector search (OpenAI + LlamaIndex), and full Q&A UI for medical device compliance.
          </>,
          <>
            Developed comprehensive documentation search capabilities enabling sales reps to quickly access complex technical information.
          </>,
        ],
        images: [],
      },
      {
        company: "The Pitch Place",
        timeframe: "06.01.2023 - 02.01.2025",
        role: "Machine Learning Engineering & Software Development",
        achievements: [
          <>
            Developed and deployed PB&J (Peanut-Butter-Jelly) dynamic document processing pipeline using three-phase approach: parsing, betterment, and JSON transformation.
          </>,
          <>
            Built Farm, a conversational RAG agent with multi-layered decision logic handling queries across various scales (full RAG, full context, chat context, limited tokens).
          </>,
          <>
            Implemented domain-agnostic system for highly technical, table-heavy PDFs with dynamic agents prioritizing data quality over processing speed.
          </>,
          <>
            Full Stack Web Development with Django, Next.js, and React for production deployment.
          </>,
        ],
        images: [],
      },
      {
        company: "NASA GSFC",
        timeframe: "01.01.2024 - 06.01.2024",
        role: "Machine Learning Intern (Pretraining / 3D Reconstruction)",
        achievements: [
          <>
            Developed 3D cloud reconstruction using perpendicular 2D views: GOES ABI top-down imagery + CloudSat side-view slices for atmospheric density prediction.
          </>,
          <>
            Implemented transfer learning between satellite platforms (MODIS 34-channel → ABI 17-channel) using wavelength-based channel reordering and spectral alignment.
          </>,
          <>
            Pre-trained large visual models (SWIN, ViT, DINO) for cloud modeling with assessment of cross-platform transfer learning effectiveness.
          </>,
          <>
            Conducted research on NASA Explore and Discover supercomputers, leading to new initiatives for next-level supercomputing facilities.
          </>,
        ],
        images: [],
      },
      {
        company: "NASA GSFC",
        timeframe: "06.01.2023 - 08.01.2023",
        role: "Machine Learning Intern (Time Series Forecasting)",
        achievements: [
          <>
            Achieved 175% improvement in Total Solar Irradiance (TSI) prediction using innovative CNN-Informer hybrid architecture with HMI disk images.
          </>,
          <>
            Designed novel approach combining CNN spatial feature extraction with SSA sub-signals (without recombination) for enhanced temporal modeling.
          </>,
          <>
            Learned PyTorch from scratch while developing end-to-end pipeline for solar physics research and space weather forecasting.
          </>,
          <>
            Leveraged visual content (sunspots, solar features) instead of statistical summaries, achieving significantly more stable future predictions.
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
        description: <>Bachelor of Science in Computer Science (2021-2025). GPA: 3.82. Teaching Assistant for Introduction to Machine Learning & Computer Systems. Dean's List Six Semesters, Cum Laude. Mentored by Dr. Leah Ding, who recognized early talent and guided research trajectory. Conducted research on DINO (self-distillation without labels) and self-supervised learning approaches.</>,
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical Skills",
    skills: [
      {
        title: "Machine Learning & AI",
        description: <>PyTorch, TensorFlow, Keras, scikit-learn, Natural Language Processing & LLMs, RAG Systems, Computer Vision, Time Series Forecasting, Transfer Learning, Self-Supervised Learning (DINO), CNN-Informer Architectures, Data Processing with NumPy, Pandas, Matplotlib, OpenCV, SciPy, Singular Spectrum Analysis (SSA).</>,
        images: [],
      },
      {
        title: "Full Stack Development",
        description: <>React, Next.js, Django, JavaScript, TypeScript, Tailwind CSS, Vercel deployment, Client-Server Communication, OOP, Dynamic Programming, Production System Design, API Development, User Interface Design.</>,
        images: [],
      },
      {
        title: "AI/ML Platforms & Tools",
        description: <>OpenAI API, LlamaIndex, HuggingFace, GitHub, Docker, CUDA, Linux, NASA Supercomputing Systems, Vector Databases, Dynamic Agent Architectures, Multi-layered Decision Systems.</>,
        images: [],
      },
      {
        title: "Domain Expertise",
        description: <>Solar Physics & Space Weather Forecasting, Atmospheric Science & Cloud Modeling, Medical Device Documentation, Technical Document Processing, Satellite Data Analysis, Multi-spectral Imaging, Document Understanding & Information Retrieval.</>,
        images: [],
      },
    ],
  },
  interests: {
    display: true, // set to false to hide this section
    title: "Interests",
    description: <>I love creating art with markers and paper, producing music (self-taught), practicing Taoist philosophy, and enjoying soccer, cycling, hiking, and baking bread. I believe in the power of combining intellectual depth with practical impact, always seeking projects that are both technologically fascinating and genuinely useful.</>,
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
      src: "/images/gallery/horizontal-1.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-2.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-3.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-4.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-1.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-2.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-3.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-4.jpg",
      alt: "image",
      orientation: "vertical",
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
  description: `Chat with an AI assistant that knows everything about ${person.name}'s background, projects, and experience`,
};

export { person, social, newsletter, home, about, blog, work, gallery, music, rag, heroProjects };
