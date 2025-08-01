import { notFound } from "next/navigation";
import { getPosts } from "@/utils/utils";
import { Meta, Schema, AvatarGroup, Button, Column, Flex, Heading, Media, Text } from "@once-ui-system/core";
import { baseURL, about, person, work } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { ScrollToHash, CustomMDX } from "@/components";
import { Metadata } from "next";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getPosts(["src", "app", "websites", "projects"]);
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

  const posts = getPosts(["src", "app", "websites", "projects"])
  let post = posts.find((post) => post.slug === slugPath);

  if (!post) return {};

  return Meta.generate({
    title: post.metadata.title,
    description: post.metadata.summary,
    baseURL: baseURL,
    image: post.metadata.image || `/api/og/generate?title=${post.metadata.title}`,
    path: `${work.path}/${post.slug}`,
  });
}

export default async function Project({
  params
}: { params: Promise<{ slug: string | string[] }> }) {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug) ? routeParams.slug.join('/') : routeParams.slug || '';

  let post = getPosts(["src", "app", "websites", "projects"]).find((post) => post.slug === slugPath);

  if (!post) {
    notFound();
  }

  const avatars =
    post.metadata.team?.map((person) => ({
      src: person.avatar,
    })) || [];

  // COMPREHENSIVE PROJECT STRUCTURED DATA FOR AI ACCESSIBILITY
  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": post.metadata.title,
    "description": post.metadata.summary,
    "url": `${baseURL}${work.path}/${post.slug}`,
    "datePublished": post.metadata.publishedAt,
    "dateModified": post.metadata.publishedAt,
    "author": {
      "@type": "Person",
      "name": person.name,
      "url": `${baseURL}${about.path}`,
      "image": `${baseURL}${person.avatar}`
    },
    "creator": {
      "@type": "Person",
      "name": person.name,
      "url": `${baseURL}${about.path}`
    },
    "publisher": {
      "@type": "Person",
      "name": person.name,
      "url": `${baseURL}${about.path}`
    },
    "image": post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`,
    "genre": "Portfolio Project",
    "keywords": post.metadata.tags || ["machine learning", "AI", "portfolio", "project"],
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
        "name": "Software Development"
      }
    ],
    "isPartOf": {
      "@type": "WebSite",
      "name": `${person.name}'s Portfolio`,
      "url": baseURL
    }
  };

  // ADDITIONAL SOFTWARE APPLICATION SCHEMA FOR TECH PROJECTS
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": post.metadata.title,
    "description": post.metadata.summary,
    "url": `${baseURL}${work.path}/${post.slug}`,
    "applicationCategory": "Portfolio Project",
    "operatingSystem": "Web",
    "author": {
      "@type": "Person",
      "name": person.name,
      "url": `${baseURL}${about.path}`
    },
    "creator": {
      "@type": "Person", 
      "name": person.name,
      "url": `${baseURL}${about.path}`
    },
    "datePublished": post.metadata.publishedAt,
    "dateModified": post.metadata.publishedAt,
    "image": post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`,
    "keywords": post.metadata.tags || ["machine learning", "AI", "portfolio", "project"]
  };

  return (
    <Column as="section" maxWidth="m" horizontal="center" gap="l">
      {/* COMPREHENSIVE STRUCTURED DATA FOR AI ACCESSIBILITY */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectSchema)
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema)
        }}
      />
      
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path={`${work.path}/${post.slug}`}
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
        <Button data-border="rounded" href="/websites" variant="tertiary" weight="default" size="s" prefixIcon="chevronLeft">
          Websites
        </Button>
        <Heading variant="display-strong-s">{post.metadata.title}</Heading>
      </Column>
      {post.metadata.images.length > 0 && (
        <Media
          priority
          aspectRatio="16 / 9"
          radius="m"
          alt="image"
          src={post.metadata.images[0]}
        />
      )}
      <Column style={{ margin: "auto" }} as="article" maxWidth="xs">
        <Flex gap="12" marginBottom="24" vertical="center">
          {post.metadata.team && <AvatarGroup reverse avatars={avatars} size="m" />}
          <Text variant="body-default-s" onBackground="neutral-weak">
            {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
          </Text>
        </Flex>
        <CustomMDX source={post.content} />
      </Column>
      <ScrollToHash />
    </Column>
  );
}
