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