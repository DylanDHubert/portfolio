import { notFound } from "next/navigation";
import { getPosts } from "@/utils/utils";
import { Meta, Schema, AvatarGroup, Button, Column, Heading, HeadingNav, Icon, Row, Text } from "@once-ui-system/core";
import { baseURL, about, person, blog } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { ScrollToHash, CustomMDX } from "@/components";
import { Metadata } from "next";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getPosts(["src", "app", "blog", "posts"]);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug) ? routeParams.slug.join('/') : routeParams.slug || '';

  const posts = getPosts(["src", "app", "blog", "posts"])
  let post = posts.find((post) => post.slug === slugPath);

  if (!post) return {};

  return Meta.generate({
    title: post.metadata.title,
    description: post.metadata.summary,
    baseURL: baseURL,
    image: post.metadata.image || `/api/og/generate?title=${post.metadata.title}`,
    path: `${blog.path}/${post.slug}`,
  });
}

export default async function BlogPost({
  params
}: { params: Promise<{ slug: string | string[] }> }) {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug) ? routeParams.slug.join('/') : routeParams.slug || '';

  let post = getPosts(["src", "app", "blog", "posts"]).find((post) => post.slug === slugPath);

  if (!post) {
    notFound();
  }

  const avatars =
    post.metadata.team?.map((person) => ({
      src: person.avatar,
    })) || [];

  // COMPREHENSIVE BLOG POST STRUCTURED DATA FOR AI ACCESSIBILITY
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": post.metadata.title,
    "description": post.metadata.summary,
    "url": `${baseURL}${blog.path}/${post.slug}`,
    "datePublished": post.metadata.publishedAt,
    "dateModified": post.metadata.publishedAt,
    "author": {
      "@type": "Person",
      "name": person.name,
      "url": `${baseURL}${about.path}`,
      "image": `${baseURL}${person.avatar}`
    },
    "publisher": {
      "@type": "Person",
      "name": person.name,
      "url": `${baseURL}${about.path}`
    },
    "image": post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`,
    "articleSection": "Machine Learning & AI",
    "keywords": post.metadata.tags || ["machine learning", "AI", "technology", "research"],
    "wordCount": post.content.split(' ').length,
    "timeRequired": "PT5M", // ESTIMATED 5 MINUTES TO READ
    "about": [
      {
        "@type": "Thing",
        "name": "Machine Learning"
      },
      {
        "@type": "Thing",
        "name": "Artificial Intelligence"
      },
      {
        "@type": "Thing",
        "name": "Technology"
      },
      {
        "@type": "Thing",
        "name": "Research"
      }
    ],
    "isPartOf": {
      "@type": "Blog",
      "name": `${person.name}'s Blog`,
      "url": `${baseURL}${blog.path}`
    },
    "mainEntity": {
      "@type": "WebPage",
      "name": post.metadata.title,
      "description": post.metadata.summary
    }
  };

  // ADDITIONAL ARTICLE SCHEMA FOR BETTER AI UNDERSTANDING
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.metadata.title,
    "description": post.metadata.summary,
    "url": `${baseURL}${blog.path}/${post.slug}`,
    "datePublished": post.metadata.publishedAt,
    "dateModified": post.metadata.publishedAt,
    "author": {
      "@type": "Person",
      "name": person.name,
      "url": `${baseURL}${about.path}`,
      "image": `${baseURL}${person.avatar}`
    },
    "publisher": {
      "@type": "Person",
      "name": person.name,
      "url": `${baseURL}${about.path}`
    },
    "image": post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`,
    "articleSection": "Machine Learning & AI",
    "keywords": post.metadata.tags || ["machine learning", "AI", "technology", "research"],
    "wordCount": post.content.split(' ').length,
    "timeRequired": "PT5M"
  };

  return (
    <Column as="section" maxWidth="m" horizontal="center" gap="l">
      {/* COMPREHENSIVE STRUCTURED DATA FOR AI ACCESSIBILITY */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema)
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostingSchema)
        }}
      />
      
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path={`${blog.path}/${post.slug}`}
        title={post.metadata.title}
        description={post.metadata.summary}
        datePublished={post.metadata.publishedAt}
        dateModified={post.metadata.publishedAt}
        image={post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Column maxWidth="xs" gap="16">
        <Button data-border="rounded" href="/blog" variant="tertiary" weight="default" size="s" prefixIcon="chevronLeft">
          Blog
        </Button>
        <Heading variant="display-strong-s">{post.metadata.title}</Heading>
      </Column>
      {post.metadata.images.length > 0 && (
        <Row gap="12" marginBottom="24" vertical="center">
          {post.metadata.team && <AvatarGroup reverse avatars={avatars} size="m" />}
          <Text variant="body-default-s" onBackground="neutral-weak">
            {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
          </Text>
        </Row>
      )}
      <Column style={{ margin: "auto" }} as="article" maxWidth="xs">
        <Row gap="12" marginBottom="24" vertical="center">
          {post.metadata.team && <AvatarGroup reverse avatars={avatars} size="m" />}
          <Text variant="body-default-s" onBackground="neutral-weak">
            {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
          </Text>
        </Row>
        <CustomMDX source={post.content} />
      </Column>
      <ScrollToHash />
    </Column>
  );
}
