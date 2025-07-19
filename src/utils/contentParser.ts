import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface BlogPost {
  title: string;
  content: string;
  publishedAt: string;
  tag: string;
}

export function parseAllContent(): string {
  const content: string[] = [];
  
  // ADD STRUCTURED CONTENT FROM CONTENT.TSX
  content.push("=== DYLAN HUBERT - COMPLETE BACKGROUND ===");
  content.push(parseStructuredContent());
  
  // Add about page content
  content.push("=== ABOUT PAGE ===");
  content.push(parseAboutPage());
  
  // Add blog posts
  content.push("=== BLOG POSTS ===");
  const blogPosts = parseBlogPosts();
  blogPosts.forEach(post => {
    content.push(`\n--- ${post.title} (${post.publishedAt}) ---`);
    content.push(`Tag: ${post.tag}`);
    content.push(post.content);
  });
  
  return content.join('\n\n');
}

function parseStructuredContent(): string {
  try {
    const contentPath = path.join(process.cwd(), 'src/resources/content.tsx');
    const contentFile = fs.readFileSync(contentPath, 'utf8');
    
    // EXTRACT KEY INFORMATION FROM CONTENT.TSX
    const structuredInfo: string[] = [];
    
    // PERSONAL INFO
    const personMatch = contentFile.match(/const person = \{[\s\S]*?\}/);
    if (personMatch) {
      structuredInfo.push("PERSONAL INFORMATION:");
      structuredInfo.push("- Name: Dylan Hubert");
      structuredInfo.push("- Role: Recent CS Graduate & ML Engineer");
      structuredInfo.push("- Email: dylandhubert@outlook.com");
      structuredInfo.push("- Location: Los Angeles");
    }
    
    // WORK EXPERIENCE
    const workMatch = contentFile.match(/work: \{[\s\S]*?\}/);
    if (workMatch) {
      structuredInfo.push("\nWORK EXPERIENCE:");
      
      // HHB AI Systems
      if (contentFile.includes('HHB AI Systems')) {
        structuredInfo.push("HHB AI Systems (06.01.2023 - Present) - Co-Founder & ML Engineer");
        structuredInfo.push("- Built Agent-Powered RAG chatbot for Stryker orthopedic implant documentation");
        structuredInfo.push("- Integrated PDF highlighting, vector search (OpenAI + LlamaIndex), and full Q&A UI");
        structuredInfo.push("- Developed PB&J (Peanut-Butter-Jelly) dynamic document processing pipeline");
        structuredInfo.push("- Built Farm, conversational RAG agent with multi-layered decision logic");
        structuredInfo.push("- Stack: Python, Streamlit, LlamaIndex, OpenAI API, Docker, GitHub");
      }
      
      // The Pitch Place
      if (contentFile.includes('The Pitch Place')) {
        structuredInfo.push("\nThe Pitch Place (06.01.2023 - 02.01.2025) - ML Engineer & Software Developer");
        structuredInfo.push("- Built semantic search system for journalist-editor matching platform");
        structuredInfo.push("- Developed RAG-based recommendation engine connecting pitches to journalists");
        structuredInfo.push("- Implemented full-stack solutions using Django, Next.js, and React");
      }
      
      // NASA GSFC
      if (contentFile.includes('NASA GSFC')) {
        structuredInfo.push("\nNASA GSFC (01.01.2024 - 06.01.2024) - Machine Learning Intern");
        structuredInfo.push("- Developed 3D cloud reconstruction using perpendicular 2D views");
        structuredInfo.push("- Implemented M2M transformer architecture with Swin/ViT backbones");
        structuredInfo.push("- Created independent masking strategy for MAE/SATMAE pretraining");
        structuredInfo.push("- Built comprehensive data pipeline for multi-platform satellite data fusion");
        
        structuredInfo.push("\nNASA GSFC (06.01.2023 - 08.01.2023) - Machine Learning Intern");
        structuredInfo.push("- Developed CNN-Informer hybrid for Total Solar Irradiance (TSI) prediction");
        structuredInfo.push("- Designed computer vision preprocessing pipeline for solar feature detection");
        structuredInfo.push("- Implemented SSA signal preservation approach for space weather forecasting");
      }
    }
    
    // SKILLS AND TECHNOLOGIES
    structuredInfo.push("\nTECHNICAL SKILLS:");
    structuredInfo.push("- Machine Learning: PyTorch, TensorFlow, Computer Vision, NLP");
    structuredInfo.push("- AI/ML: OpenAI API, LlamaIndex, RAG Systems, Vector Databases");
    structuredInfo.push("- Full Stack: React, Next.js, Django, TypeScript, Python");
    structuredInfo.push("- Cloud & Deployment: Docker, GitHub, Vercel");
    structuredInfo.push("- Domain Expertise: NASA research, medical documentation, journalism");
    
    // INTERESTS AND PERSONALITY
    structuredInfo.push("\nPERSONAL INTERESTS:");
    structuredInfo.push("- Art: Creating with markers and paper");
    structuredInfo.push("- Music: Self-taught music production");
    structuredInfo.push("- Philosophy: Taoist philosophy");
    structuredInfo.push("- Activities: Soccer, cycling, hiking, baking bread");
    
    // CURRENT STATUS
    structuredInfo.push("\nCURRENT STATUS:");
    structuredInfo.push("- Recent Computer Science graduate (May 2025)");
    structuredInfo.push("- Available for ML Engineer, Software Engineer, and AI/ML opportunities");
    structuredInfo.push("- Seeking roles where I can apply RAG systems, computer vision, and full-stack development");
    
    // READING LIST AND INFLUENCES
    structuredInfo.push("\nREADING LIST AND INFLUENCES:");
    structuredInfo.push("FICTION & HUMOR:");
    structuredInfo.push("- Hitchhikers Guide to the Galaxy (Douglas Adams) - Dry humor, favorite quote about ships hanging like bricks don't");
    structuredInfo.push("- Disc World (Terry Pratchett) - Wry humorous fiction");
    structuredInfo.push("- Lord of the Rings (JRR Tolkien) - First fiction books read");
    structuredInfo.push("- Calvin and Hobbes (Bill Waterson) - Childhood and adulthood favorite, reminds to stay having fun");
    structuredInfo.push("- Astrix and Obelix (Goscinny & Uderzo) - Classic European cartoon");
    structuredInfo.push("- Tintin (Herge) - Another classic European cartoon");
    structuredInfo.push("- Neuromancer (William Gibson) - Defined cyberpunk, influenced vision of future technology and AI systems");
    
    structuredInfo.push("\nNON-FICTION & LEARNING:");
    structuredInfo.push("- Sapiens (Yuval Noah Harari) - New perspective on systems we take for granted");
    structuredInfo.push("- Freakonomics (Levitt & Dubner) - Highly interesting studies, similar to Sapiens");
    structuredInfo.push("- Elements, Reactions, Molecules (Theodore Gray) - Sparked lifelong interest in chemistry");
    structuredInfo.push("- What If? (Randall Munroe) - Classic book by classic cartoonist");
    structuredInfo.push("- Outliers (Malcolm Gladwell) - Thesis proved true through college experience");
    structuredInfo.push("- The Psychology of Money (Morgan Housel) - Fresh perspective on decision-making and human behavior");
    
    structuredInfo.push("\nTECHNICAL & PROFESSIONAL:");
    structuredInfo.push("- Design Patterns (Gang of Four) - Definitive guide to software design patterns, influences AI system design");
    structuredInfo.push("- Refactoring (Martin Fowler) - Practical guide to code quality, valuable for complex AI systems");
    structuredInfo.push("- The C Programming Language (Kernighan & Ritchie) - Fundamentals of systems programming and memory management");
    structuredInfo.push("- Introduction to Algorithms (Cormen et al.) - Definitive algorithms textbook, essential for optimizing AI systems");
    structuredInfo.push("- The Unix Programming Environment (Kernighan & Pike) - Unix philosophy, influences modular AI system design");
    
    return structuredInfo.join('\n');
  } catch (error) {
    console.error('Error parsing structured content:', error);
    return 'Structured content not available';
  }
}

function parseAboutPage(): string {
  try {
    const aboutPath = path.join(process.cwd(), 'src/app/about/page.tsx');
    const aboutContent = fs.readFileSync(aboutPath, 'utf8');
    
    // Extract text content from JSX (basic extraction)
    const textContent = aboutContent
      .replace(/<[^>]*>/g, ' ') // Remove JSX tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return textContent;
  } catch (error) {
    console.error('Error parsing about page:', error);
    return 'About page content not available';
  }
}

function parseBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];
  const postsDir = path.join(process.cwd(), 'src/app/blog/posts');
  
  try {
    const files = fs.readdirSync(postsDir);
    
    files.forEach(file => {
      if (file.endsWith('.mdx')) {
        const filePath = path.join(postsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse frontmatter and content
        const { data, content } = matter(fileContent);
        
        posts.push({
          title: data.title || 'Untitled',
          content: content.trim(),
          publishedAt: data.publishedAt || 'Unknown',
          tag: data.tag || 'General'
        });
      }
    });
    
    // Sort by publication date (newest first)
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
  } catch (error) {
    console.error('Error parsing blog posts:', error);
  }
  
  return posts;
}

// Cache the parsed content
let cachedContent: string | null = null;

export function getContentContext(): string {
  if (!cachedContent) {
    cachedContent = parseAllContent();
  }
  return cachedContent;
} 