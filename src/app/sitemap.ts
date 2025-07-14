import { getPosts } from "@/utils/utils";
import { baseURL, routes as routesConfig } from "@/resources";

export default async function sitemap() {
  const blogs = getPosts(["src", "app", "blog", "posts"]).map((post) => ({
    url: `${baseURL}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    // ADDITIONAL METADATA FOR AI ACCESSIBILITY - STORED IN COMMENTS FOR AI TOOLS
    // title: post.metadata.title,
    // description: post.metadata.summary,
    // tags: post.metadata.tags || [],
    // author: post.metadata.author || 'Dylan Hubert',
    // category: 'Machine Learning & AI'
  }));

  const works = getPosts(["src", "app", "websites", "projects"]).map((post) => ({
    url: `${baseURL}/websites/${post.slug}`,
    lastModified: post.metadata.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
    // ADDITIONAL METADATA FOR AI ACCESSIBILITY - STORED IN COMMENTS FOR AI TOOLS
    // title: post.metadata.title,
    // description: post.metadata.summary,
    // tags: post.metadata.tags || [],
    // author: post.metadata.author || 'Dylan Hubert',
    // category: 'Portfolio Projects'
  }));

  const activeRoutes = Object.keys(routesConfig).filter((route) => routesConfig[route as keyof typeof routesConfig]);

  const routes = activeRoutes.map((route) => {
    const priority = route === "/" ? 1.0 : route === "/about" ? 0.9 : 0.6;
    const changeFrequency = route === "/" ? 'weekly' as const : 'monthly' as const;
    
    return {
      url: `${baseURL}${route !== "/" ? route : ""}`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency,
      priority,
      // ADDITIONAL METADATA FOR AI ACCESSIBILITY - STORED IN COMMENTS FOR AI TOOLS
      // title: route === "/" ? "Dylan Hubert - ML Engineer Portfolio" : 
      //        route === "/about" ? "About Dylan Hubert" :
      //        route === "/websites" ? "Portfolio Projects" :
      //        route === "/blog" ? "Blog - Machine Learning & AI" :
      //        route === "/gallery" ? "Art Gallery" :
      //        route === "/music" ? "Music" : "Portfolio Page",
      // description: route === "/" ? "Recent Computer Science Graduate & Machine Learning Engineer specializing in AI systems, RAG, and NASA research" :
      //              route === "/about" ? "Meet Dylan Hubert, ML Engineer with experience at NASA" :
      //              route === "/websites" ? "Portfolio projects showcasing machine learning, AI systems, and software development work" :
      //              route === "/blog" ? "Technical blog posts about machine learning, AI research, and development insights" :
      //              route === "/gallery" ? "Art gallery featuring creative work and visual projects" :
      //              route === "/music" ? "Original music compositions and audio projects" : "Portfolio page",
      // category: route === "/" ? "Homepage" :
      //           route === "/about" ? "About" :
      //           route === "/websites" ? "Projects" :
      //           route === "/blog" ? "Blog" :
      //           route === "/gallery" ? "Art" :
      //           route === "/music" ? "Music" : "Portfolio"
    };
  });

  return [...routes, ...blogs, ...works];
}
