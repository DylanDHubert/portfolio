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
  
  // Add CHART research post
  content.push("=== CHART RESEARCH POST ===");
  content.push(parseChartPage());
  
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

    
    structuredInfo.push("\nNON-FICTION & LEARNING:");
    structuredInfo.push("- Sapiens (Yuval Noah Harari) - New perspective on systems we take for granted");
    structuredInfo.push("- Freakonomics (Levitt & Dubner) - Highly interesting studies, similar to Sapiens");
    structuredInfo.push("- Elements, Reactions, Molecules (Theodore Gray) - Sparked lifelong interest in chemistry");
    structuredInfo.push("- What If? (Randall Munroe) - Classic book by classic cartoonist");
    structuredInfo.push("- Outliers (Malcolm Gladwell) - Thesis proved true through college experience");
    structuredInfo.push("- The Psychology of Money (Morgan Housel) - Fresh perspective on decision-making and human behavior");
    

    
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

function parseChartPage(): string {
  try {
    const chartPath = path.join(process.cwd(), 'src/app/chart/page.tsx');
    const chartContent = fs.readFileSync(chartPath, 'utf8');
    
    // EXTRACT KEY CONTENT FROM CHART PAGE
    const chartInfo: string[] = [];
    
    chartInfo.push("CHART: Coarse-to-Fine Hierarchical Attention for Recursive Traversal");
    chartInfo.push("Published: 2025-11-17");
    chartInfo.push("Category: Machine Learning & AI Research");
    chartInfo.push("URL: /chart");
    chartInfo.push("");
    
    // EXTRACT MAIN SECTIONS
    chartInfo.push("DESCRIPTION:");
    chartInfo.push("A transformer-based approach to embedding search that learns to traverse hierarchical semantic trees, enabling relationship-based retrieval instead of distance-based nearest neighbor search.");
    chartInfo.push("");
    
    chartInfo.push("KEY CONCEPTS:");
    chartInfo.push("- Embeddings contain real semantic information");
    chartInfo.push("- Transformers learn relationships");
    chartInfo.push("- Problem: Embeddings only show distances, not relationships or hierarchy");
    chartInfo.push("- Solution: Use transformers to learn how to navigate embedding space");
    chartInfo.push("- Core insight: Pre-organize corpus into a hierarchical tree, then traverse coarse-to-fine");
    chartInfo.push("");
    
    chartInfo.push("ARCHITECTURE:");
    chartInfo.push("1. Hierarchical Semantic Tree: Built via recursive clustering (k=2), leaves contain documents, parents contain centroid embeddings");
    chartInfo.push("2. Fixed-Size Frontier: Maintains bounded attention window (e.g., 128 tokens) regardless of corpus size");
    chartInfo.push("3. Coarse-to-Fine Traversal: Start with root nodes, expand top attention nodes, replace with children, remove low attention nodes");
    chartInfo.push("4. Three-Stage Training Curriculum:");
    chartInfo.push("   A. Localization: Descend hierarchy to locate single document (Single-Target BCE)");
    chartInfo.push("   B. Relational Localization: Find document and related documents (Multi-Target BCE)");
    chartInfo.push("   C. Embedding Refinement: Reshape embedding space for coherent hierarchy (InfoNCE)");
    chartInfo.push("");
    
    chartInfo.push("COMPUTATIONAL COMPLEXITY:");
    chartInfo.push("- Time: O(log N) traversal time");
    chartInfo.push("- Space: Only loads frontier, not full dataset");
    chartInfo.push("- Attention: Fixed O(N²) where N is max_seq_len (bounded), not corpus size");
    chartInfo.push("");
    
    chartInfo.push("KEY DIFFERENCES FROM TRADITIONAL ANN:");
    chartInfo.push("- ANN: distance-based, flat, retrieves nearest neighbors");
    chartInfo.push("- CHART: relationship-based, topological, retrieves meaningful connections");
    chartInfo.push("- CHART learns semantic relationships between distant but related embeddings");
    chartInfo.push("");
    
    chartInfo.push("CURRENT STATUS:");
    chartInfo.push("- Core codebase written");
    chartInfo.push("- Two datasets built (first was a dead end)");
    chartInfo.push("- Initial training and evaluation loops running");
    chartInfo.push("- Next post will cover: dataset construction, implementation details, initial results, and iterations");
    chartInfo.push("");
    
    chartInfo.push("TECHNICAL DETAILS TO BE COVERED IN FOLLOW-UP:");
    chartInfo.push("- Seeding the attention window: how initial sequence is populated and query embedding integrated");
    chartInfo.push("- Embeddings as tokens: projection layers and tokenization strategy");
    chartInfo.push("- Training dynamics: curriculum scheduling, stage-wise loss weighting, stabilization");
    chartInfo.push("- Evaluation metrics: traversal interpretability and hierarchy coherence");
    
    return chartInfo.join('\n');
  } catch (error) {
    console.error('Error parsing chart page:', error);
    return 'Chart page content not available';
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