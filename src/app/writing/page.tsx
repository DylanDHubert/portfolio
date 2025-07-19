import { Column, Heading, Meta, Schema, Text, Flex, SmartLink, Tag } from "@once-ui-system/core";
import { baseURL, person } from "@/resources";
import styles from "./Writing.module.scss";

const writing = {
  title: "Writing",
  description: "Creative writing, personal essays, and stories that explore life, philosophy, and the human experience.",
  path: "/writing",
};

export async function generateMetadata() {
  return Meta.generate({
    title: writing.title,
    description: writing.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(writing.title)}`,
    path: writing.path,
  });
}

// CREATIVE WRITING PIECES
const writingPieces = [
  {
    slug: "theia",
    title: "Theia",
    summary: "A haunting story about an aging painter whose obsession with perfection and deteriorating vision leads to a devastating conclusion.",
    publishedAt: "2025-03-22",
    readingTime: "12 min read",
    genre: "Literary Fiction",
    tags: ["Art", "Aging", "Perfection", "Vision", "Dark"],
    image: "/images/placeholder/theia.jpg",
    featured: true,
  },
  {
    slug: "the-last-cafe-on-earth",
    title: "The Last Café on Earth",
    summary: "A short story about a barista who serves coffee to the last remaining humans in a post-apocalyptic world.",
    publishedAt: "2025-01-15",
    readingTime: "8 min read",
    genre: "Science Fiction",
    tags: ["Post-Apocalyptic", "Human Connection", "Coffee"],
    image: "/images/placeholder/cafe-story.jpg",
    featured: true,
  },
  {
    slug: "letters-to-my-future-self",
    title: "Letters to My Future Self",
    summary: "A collection of personal reflections on growth, change, and the passage of time.",
    publishedAt: "2025-01-10",
    readingTime: "5 min read",
    genre: "Personal Essay",
    tags: ["Reflection", "Growth", "Time"],
    image: "/images/placeholder/letters.jpg",
    featured: false,
  },
  {
    slug: "the-art-of-stillness",
    title: "The Art of Stillness",
    summary: "How I learned to find peace in the chaos of modern life through Taoist philosophy and daily practice.",
    publishedAt: "2024-12-20",
    readingTime: "6 min read",
    genre: "Philosophy",
    tags: ["Taoism", "Mindfulness", "Peace"],
    image: "/images/placeholder/stillness.jpg",
    featured: false,
  },
];

export default function Writing() {
  const featuredPieces = writingPieces.filter(piece => piece.featured);
  const regularPieces = writingPieces.filter(piece => !piece.featured);

  return (
    <Column maxWidth="l" gap="xl">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={writing.title}
        description={writing.description}
        path={writing.path}
        image={`/api/og/generate?title=${encodeURIComponent(writing.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}/about`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      {/* HERO SECTION */}
      <Column gap="24" horizontal="center">
        <Heading variant="display-strong-l" className={styles.heroTitle}>
          Writing
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" className={styles.heroDescription}>
          Creative writing, personal essays, and stories that explore life, philosophy, 
          and the human experience. From short stories to philosophical reflections.
        </Text>
      </Column>

      {/* FEATURED PIECES */}
      {featuredPieces.length > 0 && (
        <Column gap="32">
          <Heading variant="heading-strong-l" className={styles.sectionTitle}>
            Featured Pieces
          </Heading>
          <div className={styles.featuredGrid}>
            {featuredPieces.map((piece) => (
              <SmartLink
                key={piece.slug}
                href={`/writing/${piece.slug}`}
                className={styles.featuredCard}
                unstyled
              >
                <div className={styles.featuredImage}>
                  <div className={styles.imagePlaceholder} />
                </div>
                <div className={styles.featuredContent}>
                  <div className={styles.metaInfo}>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {piece.publishedAt}
                    </Text>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {piece.readingTime}
                    </Text>
                    <Tag label={piece.genre} variant="neutral" />
                  </div>
                  <Heading variant="heading-strong-m" className={styles.featuredTitle}>
                    {piece.title}
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak" className={styles.featuredSummary}>
                    {piece.summary}
                  </Text>
                  <div className={styles.tags}>
                    {piece.tags.map((tag, index) => (
                      <Tag key={index} label={tag} variant="neutral" />
                    ))}
                  </div>
                </div>
              </SmartLink>
            ))}
          </div>
        </Column>
      )}

      {/* REGULAR PIECES */}
      {regularPieces.length > 0 && (
        <Column gap="32">
          <Heading variant="heading-strong-l" className={styles.sectionTitle}>
            All Pieces
          </Heading>
          <div className={styles.regularGrid}>
            {regularPieces.map((piece) => (
              <SmartLink
                key={piece.slug}
                href={`/writing/${piece.slug}`}
                className={styles.regularCard}
                unstyled
              >
                <div className={styles.regularImage}>
                  <div className={styles.imagePlaceholder} />
                </div>
                <div className={styles.regularContent}>
                  <div className={styles.metaInfo}>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {piece.publishedAt}
                    </Text>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {piece.readingTime}
                    </Text>
                    <Tag label={piece.genre} variant="neutral" />
                  </div>
                  <Heading variant="heading-strong-s" className={styles.regularTitle}>
                    {piece.title}
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak" className={styles.regularSummary}>
                    {piece.summary}
                  </Text>
                  <div className={styles.tags}>
                    {piece.tags.map((tag, index) => (
                      <Tag key={index} label={tag} variant="neutral" />
                    ))}
                  </div>
                </div>
              </SmartLink>
            ))}
          </div>
        </Column>
      )}
    </Column>
  );
} 