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
  location: "America/Los_Angeles", // San Francisco timezone
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
  headline: <>Dylan Donnelly Hubert</>,
  featured: {
    display: false,
  },

  subline: (
    <>
    BIO LINE I
    <br/>
    BIO LINE II
    <br/>
    BIO LINE III
    </>
  ),
};

const heroProjects = [
  {
    title: "pb&j",
    subtitle: "RAG System Data Pipeline",
    href: "/work/pbj-rag-system",
  },
  {
    title: "farm",
    subtitle: "RAG System Retrieval Agent", 
    href: "/work/farm-rag-agent",
  },
  {
    title: "eudaemonia",
    subtitle: "Personal Wellness Tracker",
    href: "/work/eudaemonia-wellness",
  },
  {
    title: "undergraduate research",
    subtitle: "NASA + Academic",
    href: "/work/nasa-ml-research",
  },
];

const about = {
  path: "/about",
  label: "About",
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
        Dylan is a Machine Learning Engineer and Full Stack Developer based in San Francisco, with a passion for building intelligent systems and solving complex problems. His work spans from NASA research projects to production-ready RAG systems and full-stack applications.
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
      {
        company: "Stryker MedTech",
        timeframe: "May 2025 - Present",
        role: "ML Engineer & Full Stack Developer (Contract/Freelance)",
        achievements: [
          <>
            Built an internal Retrieval-Augmented Generation (RAG) chatbot to search and summarize highly technical orthopedic implant documentation.
          </>,
          <>
            Integrated PDF highlighting, vector search (OpenAI + LlamaIndex), and full Q&A UI.
          </>,
        ],
        images: [],
      },
      {
        company: "The Pitch Place",
        timeframe: "June 2023 - February 2025",
        role: "Machine Learning Engineering & Software Development",
        achievements: [
          <>
            Developed and deployed Retrieval–Augmented Generation (RAG) system for document search and summarization.
          </>,
          <>
            Full Stack Web Development with Django, Next.js, and React.
          </>,
        ],
        images: [],
      },
      {
        company: "NASA Goddard Space Flight Center",
        timeframe: "January 2024 - June 2024",
        role: "Machine Learning Intern (Pretraining / 3D Reconstruction)",
        achievements: [
          <>
            3D Cloud Modeling & Pre–Training Large Visual Models with assessment of Transfer Learning across similar datasets.
          </>,
          <>
            Worked with Linux, GitHub/HuggingFace, and Transformer Architecture (SWIN, ViT, DINO).
          </>,
        ],
        images: [],
      },
      {
        company: "NASA Goddard Space Flight Center",
        timeframe: "June 2023 - August 2023",
        role: "Machine Learning Intern (Time Series Forecasting)",
        achievements: [
          <>
            Continuation of the Predicting Total Solar Irradiance With HMI Disk Images research project.
          </>,
          <>
            Skills: PyTorch, Keras, Model Architecture, Feature Extraction.
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
        description: <>Bachelor of Science in Computer Science (2021-2025). GPA: 3.82. Teaching Assistant for Introduction to Machine Learning & Computer Systems. Dean's List Six Semesters, Cum Laude.</>,
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical Skills",
    skills: [
      {
        title: "Machine Learning & AI",
        description: <>PyTorch, TensorFlow, Keras, sklearn, Natural Language Processing & LLMs, Model Design & Training, Data Processing with numpy, Pandas, MatPlotLib, openCV, SciPy.</>,
        images: [],
      },
      {
        title: "Full Stack Development",
        description: <>React, Next.js, Django, JavaScript, TypeScript, Tailwind CSS, Vercel deployment, Client-Server Communication, OOP, Dynamic Programming.</>,
        images: [],
      },
      {
        title: "Tools & Technologies",
        description: <>Docker, CUDA, GitHub, HuggingFace, LlamaIndex, OpenAI API, Streamlit, Unity, C, C#, Linux.</>,
        images: [],
      },
    ],
  },
};

const blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing about design and tech...",
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const gallery = {
  path: "/gallery",
  label: "Gallery",
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

export { person, social, newsletter, home, about, blog, work, gallery, heroProjects };
