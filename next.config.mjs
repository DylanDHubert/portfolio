import mdx from "@next/mdx";
import path from "path";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote"],
  // CHART MOVED FROM ITS OWN PAGE INTO THE BLOG
  async redirects() {
    return [{ source: "/chart", destination: "/blog/chart-coarse-to-fine-traversal", permanent: true }];
  },
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
  webpack: (config, { isServer }) => {
    // Ensure path aliases work correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'src'),
    };
    return config;
  },
};

export default withMDX(nextConfig);
