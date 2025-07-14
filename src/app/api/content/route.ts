import { NextResponse } from 'next/server';
import { getPosts } from '@/utils/utils';
import { baseURL, person, social } from '@/resources';

export async function GET() {
  // GET ALL CONTENT FOR AI ACCESSIBILITY
  const blogPosts = getPosts(["src", "app", "blog", "posts"]);
  const projects = getPosts(["src", "app", "websites", "projects"]);

  // COMPREHENSIVE CONTENT STRUCTURE FOR AI TOOLS
  const contentData = {
    // WEBSITE METADATA
    website: {
      name: `${person.name}'s Portfolio`,
      url: baseURL,
      description: "Portfolio website showcasing machine learning engineering work, AI systems, and research projects",
      author: {
        name: person.name,
        role: person.role,
        email: person.email,
        social: social.map(s => ({ platform: s.name, url: s.link })),
        about: `${baseURL}/about`
      }
    },

    // BLOG POSTS WITH DETAILED METADATA
    blogPosts: blogPosts.map(post => ({
      title: post.metadata.title,
      slug: post.slug,
      url: `${baseURL}/blog/${post.slug}`,
      summary: post.metadata.summary,
      publishedAt: post.metadata.publishedAt,
      tags: post.metadata.tags || [],
      category: "Machine Learning & AI",
      content: post.content, // FULL CONTENT FOR AI ANALYSIS
      wordCount: post.content.split(' ').length,
      estimatedReadTime: Math.ceil(post.content.split(' ').length / 200), // 200 words per minute
      topics: extractTopics(post.content),
      technicalTerms: extractTechnicalTerms(post.content)
    })),

    // PORTFOLIO PROJECTS WITH DETAILED METADATA
    projects: projects.map(project => ({
      title: project.metadata.title,
      slug: project.slug,
      url: `${baseURL}/websites/${project.slug}`,
      summary: project.metadata.summary,
      publishedAt: project.metadata.publishedAt,
      tags: project.metadata.tags || [],
      category: "Portfolio Projects",
      content: project.content, // FULL CONTENT FOR AI ANALYSIS
      wordCount: project.content.split(' ').length,
      technologies: extractTechnologies(project.content),
      features: extractFeatures(project.content),
      challenges: extractChallenges(project.content)
    })),

    // STATISTICS FOR AI UNDERSTANDING
    statistics: {
      totalBlogPosts: blogPosts.length,
      totalProjects: projects.length,
      totalContent: blogPosts.length + projects.length,
      averageBlogLength: Math.round(blogPosts.reduce((acc, post) => acc + post.content.split(' ').length, 0) / blogPosts.length),
      averageProjectLength: Math.round(projects.reduce((acc, project) => acc + project.content.split(' ').length, 0) / projects.length),
      mostCommonTopics: getMostCommonTopics([...blogPosts, ...projects]),
      mostCommonTechnologies: getMostCommonTechnologies([...blogPosts, ...projects])
    },

    // CONTENT CATEGORIES FOR AI ORGANIZATION
    categories: {
      machineLearning: blogPosts.filter(post => 
        post.metadata.tags?.includes('machine learning') || 
        post.content.toLowerCase().includes('machine learning')
      ).length,
      artificialIntelligence: blogPosts.filter(post => 
        post.metadata.tags?.includes('ai') || 
        post.content.toLowerCase().includes('artificial intelligence')
      ).length,
      research: blogPosts.filter(post => 
        post.metadata.tags?.includes('research') || 
        post.content.toLowerCase().includes('research')
      ).length,
      nasa: blogPosts.filter(post => 
        post.content.toLowerCase().includes('nasa')
      ).length,
      rag: blogPosts.filter(post => 
        post.content.toLowerCase().includes('rag') || 
        post.content.toLowerCase().includes('retrieval augmented generation')
      ).length
    }
  };

  return NextResponse.json(contentData, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      // ADDITIONAL HEADERS FOR AI ACCESSIBILITY
      'X-Content-Type': 'portfolio-data',
      'X-Author': person.name,
      'X-Description': 'Comprehensive portfolio content for AI tools'
    }
  });
}

// HELPER FUNCTIONS FOR CONTENT ANALYSIS
function extractTopics(content: string): string[] {
  const topics = [
    'machine learning', 'artificial intelligence', 'deep learning', 'neural networks',
    'computer vision', 'natural language processing', 'time series', 'forecasting',
    'RAG', 'retrieval augmented generation', 'semantic search', 'embeddings',
    'NASA', 'satellite data', 'solar physics', 'cloud modeling',
    'PyTorch', 'TensorFlow', 'React', 'Next.js', 'Django',
    'full stack', 'software development', 'API development'
  ];
  
  return topics.filter(topic => 
    content.toLowerCase().includes(topic.toLowerCase())
  );
}

function extractTechnicalTerms(content: string): string[] {
  const technicalTerms = [
    'CNN', 'transformer', 'informer', 'MAE', 'SATMAE', 'SSA',
    'swin', 'ViT', 'vision transformer', 'M2M', 'transfer learning',
    'pretraining', 'fine-tuning', 'embedding', 'vector database',
    'semantic search', 'content-based filtering', 'recommendation system',
    'dynamic document processing', 'PDF parsing', 'JSON transformation',
    'multi-layered decision', 'agent architecture', 'conversational AI'
  ];
  
  return technicalTerms.filter(term => 
    content.toLowerCase().includes(term.toLowerCase())
  );
}

function extractTechnologies(content: string): string[] {
  const technologies = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Django',
    'PyTorch', 'TensorFlow', 'scikit-learn', 'NumPy', 'Pandas',
    'OpenAI API', 'LlamaIndex', 'HuggingFace', 'Docker', 'CUDA',
    'GitHub', 'Vercel', 'Tailwind CSS', 'OpenCV', 'Matplotlib'
  ];
  
  return technologies.filter(tech => 
    content.toLowerCase().includes(tech.toLowerCase())
  );
}

function extractFeatures(content: string): string[] {
  // EXTRACT FEATURES BASED ON COMMON PATTERNS
  const featurePatterns = [
    /built.*system/i, /developed.*pipeline/i, /created.*tool/i,
    /implemented.*solution/i, /designed.*architecture/i, /built.*application/i
  ];
  
  const features: string[] = [];
  featurePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      features.push(matches[0]);
    }
  });
  
  return features;
}

function extractChallenges(content: string): string[] {
  // EXTRACT CHALLENGES BASED ON COMMON PATTERNS
  const challengePatterns = [
    /challenge.*was/i, /difficulty.*in/i, /problem.*with/i,
    /complex.*data/i, /messy.*data/i, /technical.*challenge/i
  ];
  
  const challenges: string[] = [];
  challengePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      challenges.push(matches[0]);
    }
  });
  
  return challenges;
}

function getMostCommonTopics(content: any[]): string[] {
  const allTopics = content.flatMap(item => extractTopics(item.content));
  const topicCounts = allTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([topic]) => topic);
}

function getMostCommonTechnologies(content: any[]): string[] {
  const allTechnologies = content.flatMap(item => extractTechnologies(item.content));
  const techCounts = allTechnologies.reduce((acc, tech) => {
    acc[tech] = (acc[tech] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(techCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tech]) => tech);
} 