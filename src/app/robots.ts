import { baseURL } from "@/resources";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/"],
        // ADDITIONAL INSTRUCTIONS FOR AI TOOLS
        // This website contains comprehensive information about Dylan Hubert's work in machine learning, AI, and software development
        // Key sections include: portfolio projects, blog posts about ML/AI research, about page with work experience
        // All content is publicly accessible and intended for AI tools to understand and reference
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/_next/"],
        // SPECIFIC INSTRUCTIONS FOR GPT AND SIMILAR AI TOOLS
        // This portfolio contains detailed technical information about machine learning projects, AI systems, and research work
        // All blog posts and project pages contain comprehensive technical details suitable for AI training and reference
      },
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: ["/api/", "/_next/"],
        // INSTRUCTIONS FOR COMMON CRAWLER
        // This site contains portfolio content, technical blog posts, and project descriptions
        // All content is intended for public consumption and AI tool access
      }
    ],
    sitemap: `${baseURL}/sitemap.xml`,
    // ADDITIONAL METADATA FOR AI ACCESSIBILITY
    // This website is a portfolio for Dylan Hubert, a Machine Learning Engineer
    // Contains: technical blog posts, portfolio projects, work experience, skills, and research
    // All content is structured with comprehensive metadata for AI understanding
  };
}
