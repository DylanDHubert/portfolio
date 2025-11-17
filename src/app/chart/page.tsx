import { Column, Heading, Text, Meta, Schema, Button, Card, InlineCode, Table } from "@once-ui-system/core";
import { baseURL, person, blog } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { ScrollToHash } from "@/components";
import { D3Visual1, D3Visual2, D3Visual3 } from "@/components/chart/D3Placeholders";
import styles from "./Chart.module.scss";

export async function generateMetadata() {
  return Meta.generate({
    title: "CHART: Coarse-to-Fine Transformer Traversal for Embedding Search",
    description: "A transformer-based approach to embedding search that learns to traverse hierarchical semantic trees, enabling relationship-based retrieval instead of distance-based nearest neighbor search.",
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent("CHART: Coarse-to-Fine Transformer Traversal")}`,
    path: "/chart",
  });
}

export default function ChartPage() {
  const publishedAt = "2025-01-15"; // UPDATE THIS WHEN PUBLISHING

  // COMPREHENSIVE BLOG POST STRUCTURED DATA FOR AI ACCESSIBILITY
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "CHART: Coarse-to-Fine Transformer Traversal for Embedding Search",
    "description": "A transformer-based approach to embedding search that learns to traverse hierarchical semantic trees",
    "url": `${baseURL}/chart`,
    "datePublished": publishedAt,
    "dateModified": publishedAt,
    "author": {
      "@type": "Person",
      "name": person.name,
      "url": `${baseURL}/about`,
      "image": `${baseURL}${person.avatar}`
    },
    "publisher": {
      "@type": "Person",
      "name": person.name,
      "url": `${baseURL}/about`
    },
    "image": `/api/og/generate?title=${encodeURIComponent("CHART: Coarse-to-Fine Transformer Traversal")}`,
    "articleSection": "Machine Learning & AI",
    "keywords": ["machine learning", "transformers", "embedding search", "RAG", "vector search", "semantic search", "attention mechanisms"],
    "timeRequired": "PT10M",
    "about": [
      {
        "@type": "Thing",
        "name": "Machine Learning"
      },
      {
        "@type": "Thing",
        "name": "Transformers"
      },
      {
        "@type": "Thing",
        "name": "Embedding Search"
      }
    ],
    "isPartOf": {
      "@type": "Blog",
      "name": `${person.name}'s Blog`,
      "url": `${baseURL}${blog.path}`
    }
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
      
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path="/chart"
        title="CHART: Coarse-to-Fine Transformer Traversal for Embedding Search"
        description="A transformer-based approach to embedding search that learns to traverse hierarchical semantic trees"
        datePublished={publishedAt}
        dateModified={publishedAt}
        image={`/api/og/generate?title=${encodeURIComponent("CHART: Coarse-to-Fine Transformer Traversal")}`}
        author={{
          name: person.name,
          url: `${baseURL}/about`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      
      <Column maxWidth="s" gap="16">
        <Button data-border="rounded" href="/blog" variant="tertiary" weight="default" size="s" prefixIcon="chevronLeft">
          Blog
        </Button>
        <Heading variant="display-strong-m">CHART: Coarse-to-Fine Transformer Traversal for Embedding Search</Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          {formatDate(publishedAt)}
        </Text>
      </Column>

      <Column style={{ margin: "auto" }} as="article" maxWidth="s" gap="m">
        {/* INTRODUCTION */}
        <Column gap="s">
          <Heading as="h2" variant="heading-strong-xl" style={{ marginTop: "12px", marginBottom: "6px" }}>
            Introduction — Two Priors
          </Heading>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            This project rests on two priors that, when combined, point to a very natural architectural idea.
          </Text>
          
          <Column gap="s" style={{ marginTop: "8px" }}>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>1. Embeddings contain real semantic information.</Text>
            </Text>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              Models like BERT, OpenAI&apos;s text-embeddings, and all modern vector systems give us dense vectors that encode meaning surprisingly well.
            </Text>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              But a problem remains:
            </Text>
            <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
              <Column padding="24" vertical="center" horizontal="center" fillWidth>
                <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                  Embeddings do not tell you how concepts relate, only how far apart they are.
                  There is no hierarchy, no paths, no structure. Only distances.
                </Text>
              </Column>
            </div>
          </Column>

          <Column gap="s" style={{ marginTop: "8px" }}>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>2. Transformers learn relationships.</Text>
            </Text>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              Self-attention is fundamentally a learned relational operator — a dynamic, content-based graph over tokens.
            </Text>
          </Column>

          <div className={styles.chartCard} style={{ marginTop: "8px", marginBottom: "4px" }}>
            <Column padding="24" vertical="center" horizontal="center" fillWidth gap="4">
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%", textAlign: "center" }}>These two ideas collide:</Text>
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                If embeddings hold meaning, and attention learns relationships,
                can a transformer learn to traverse embedding space?
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                That is the seed of CHART.
              </Text>
            </Column>
          </div>
        </Column>

        {/* THE OBVIOUS PROBLEM */}
        <Column gap="s">
          <Heading as="h2" variant="heading-strong-xl" style={{ marginTop: "12px", marginBottom: "6px" }}>
            The Obvious Problem With Applying Attention to a Corpus
          </Heading>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            You cannot simply run attention directly over your entire embedding database.
          </Text>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            A corpus might have <InlineCode>10M–100M</InlineCode> embeddings.
          </Text>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            Self-attention is <InlineCode>O(N²)</InlineCode>.
          </Text>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            So the naive idea — &quot;just run a transformer over the embeddings&quot; — is impossible.
          </Text>
          
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "8px" }}>
            We need a way to:
          </Text>
          <Column as="ul" gap="xs" style={{ listStyle: "none", paddingLeft: "0", marginTop: "4px" }}>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              • Work at coarse scales first
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              • Narrow into fine scales
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              • Keep the sequence length bounded
            </Text>
          </Column>
          <Text variant="body-default-m" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "4px" }}>
            This leads to the structural insight.
          </Text>
        </Column>

        {/* ORGANIZING THE EMBEDDING SPACE */}
        <Column gap="s">
          <Heading as="h2" variant="heading-strong-xl" style={{ marginTop: "12px", marginBottom: "6px" }}>
            Organizing the Embedding Space Into a Tree
          </Heading>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            If we pre-organize the corpus into a tree, we can traverse coarse-to-fine without ever loading the full dataset.
          </Text>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            The tree is built very simply:
          </Text>
          <Column as="ul" gap="xs" style={{ listStyle: "none", paddingLeft: "0", marginTop: "4px" }}>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              • Run recursive clustering (<InlineCode>k=2</InlineCode> or small <InlineCode>k</InlineCode>).
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              • Leaves contain chunks/documents.
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              • Parents contain centroid embeddings (means of children).
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              • Higher parents contain means of means, recursively.
            </Text>
          </Column>
          <Text variant="body-default-m" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "4px" }}>
            This gives a natural multiscale structure.
          </Text>

          {/* D3 VISUAL 1 */}
          <D3Visual1 />
        </Column>

        {/* TRAVERSAL */}
        <Column gap="s">
          <Heading as="h2" variant="heading-strong-xl" style={{ marginTop: "12px", marginBottom: "6px" }}>
            Traversal: How the Transformer Maintains Sequence Length
          </Heading>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            This is the missing piece people usually ignore.
          </Text>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            We must keep the transformer&apos;s context fixed — e.g., <InlineCode>128</InlineCode> tokens — regardless of corpus size.
          </Text>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "8px" }}>
            CHART does this by maintaining a fixed-size active set:
          </Text>
          <Column as="ul" gap="xs" style={{ listStyle: "none", paddingLeft: "0", marginTop: "4px" }}>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              • Start with <InlineCode>K₀</InlineCode> top-level nodes (<InlineCode>K₀</InlineCode> ~ <InlineCode>64–128</InlineCode>).
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              • Run one transformer step.
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              • Compute attention scores over these nodes.
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              • Expand only the top <InlineCode>α</InlineCode> fraction (<InlineCode>α</InlineCode> ~ <InlineCode>0.25</InlineCode>).
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              • Replace each expanded node with its children.
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              • Trim back to a fixed size K for the next step.
            </Text>
          </Column>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "8px" }}>
            This creates a bounded attention window, e.g.:
          </Text>
          <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
            <Column padding="24" vertical="center" horizontal="center" fillWidth>
              <Text variant="body-default-l" onBackground="neutral-medium" style={{ fontFamily: "monospace", lineHeight: "175%", textAlign: "center" }}>
                Step 0: <InlineCode>64</InlineCode> top nodes<br />
                Step 1: Expand <InlineCode>16</InlineCode> → replace with ≈ <InlineCode>64</InlineCode> children<br />
                Step 2: Expand <InlineCode>16</InlineCode> → replace with ≈ <InlineCode>64</InlineCode> children<br />
                ...
              </Text>
            </Column>
          </div>
          <Text variant="body-default-m" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "4px" }}>
            Structure is never fully loaded — only the frontier.
          </Text>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            This is CHART&apos;s core computational trick.
          </Text>

          {/* D3 VISUAL 2 */}
          <D3Visual2 />
        </Column>

        {/* TRAINING */}
        <Column gap="xs">
          <Heading as="h2" variant="heading-strong-xl" style={{ marginTop: "12px", marginBottom: "4px" }}>
            Training Objectives: A Three-Stage Curriculum
          </Heading>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            Three stages build from basic localization to relational reasoning to embedding-space refinement. <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>The transformer never learns to manage sequence length</Text> — we enforce a fixed-size frontier at every step; the model only learns to navigate within that bounded set.
          </Text>

          <Column gap="xs" style={{ marginTop: "4px" }}>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>A. Localization</Text> — Descend the hierarchy to locate a single document. For anchor A: start at root, present fixed-size candidate nodes, label exactly one correct path per step. Train with BCE (one positive, many negatives). Teaches basic tree geometry: given an embedding, find the correct coarse-to-fine route. No multi-path reasoning yet.
            </Text>
            <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
              <Column padding="24" vertical="center" horizontal="center" fillWidth>
                <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                  Find correct coarse–to–fine path to locate query document.
                </Text>
              </Column>
            </div>
          </Column>

          <Column gap="xs" style={{ marginTop: "4px" }}>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>B. Relational Localization</Text> — Generalize to find a document and its related documents. For anchor A, include neighbors: linked documents, reply-chains, citations, co-retrieved items, graph edges. Multiple frontier nodes may be correct → multi-label BCE. Each subtree gets <InlineCode>0/1</InlineCode> label for whether it leads toward any target (A, B, C, …). Teaches semantic routing: explore multiple paths toward meaningful neighbors. Traversal becomes reasoning, not just following.
            </Text>
            <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
              <Column padding="24" vertical="center" horizontal="center" fillWidth>
                <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                  Explore multiple paths to locate query and related documents.
                </Text>
              </Column>
            </div>
          </Column>

          <Column gap="xs" style={{ marginTop: "4px" }}>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>C. Embedding Refinement</Text> — Close the loop: reshape embedding space so learned paths become easier and coherent. Use InfoNCE for comparative pressure: pull anchors toward relational neighbors, push away from unrelated nodes, improve cluster coherence, align tree boundaries with semantic relationships. After updating embeddings: recompute coherence for affected leaf clusters only, split inconsistent clusters, merge overly tight ones, update centroids upward, leave rest untouched. Results in a self-correcting hierarchy that aligns with discovered relationships.
            </Text>
            <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
              <Column padding="24" vertical="center" horizontal="center" fillWidth>
                <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                  Reshape the embedding space for a more meaningful heirarchical structure.
                </Text>
              </Column>
            </div>
          </Column>
        </Column>

        {/* PUTTING IT ALL TOGETHER */}
        <Column gap="s">
          <Heading as="h2" variant="heading-strong-xl" style={{ marginTop: "12px", marginBottom: "6px" }}>
            Now We Put It All Together — CHART
          </Heading>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            By this point, the system has all the necessary ingredients:
          </Text>
          <Column as="ol" gap="s" style={{ listStyle: "decimal", paddingLeft: "24px", marginTop: "8px" }}>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>A hierarchical semantic tree</Text> — built from clustering, storing centroids and summaries.
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>A transformer that reasons over a fixed-size frontier</Text> — stepping coarse → medium → fine.
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>A training loop that uses real relational structure</Text> — to teach traversal.
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>A dynamic maintenance loop</Text> — that keeps the hierarchy coherent without expensive rebuilds.
            </Text>
          </Column>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "8px" }}>
            <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>The result:</Text>
          </Text>
          <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
            <Column padding="24" vertical="center" horizontal="center" fillWidth>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                A transformer that traverses embedding space in <InlineCode>O(log N)</InlineCode> time,
                learning relationships between distant but semantically related embeddings.
              </Text>
            </Column>
          </div>
          <Text variant="body-default-m" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "4px" }}>
            This is the CHART architecture.
          </Text>
        </Column>

        {/* WHY THIS MATTERS */}
        <Column gap="s">
          <Heading as="h2" variant="heading-strong-xl" style={{ marginTop: "12px", marginBottom: "6px" }}>
            Why This Matters
          </Heading>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            Traditional vector search does:
          </Text>
          <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
            <Column padding="24" vertical="center" horizontal="center" fillWidth>
              <Text variant="body-default-l" onBackground="neutral-medium" style={{ fontFamily: "monospace", lineHeight: "175%", textAlign: "center" }}>
                Query → ANN → Top-k → Rerank with cross-encoder.
              </Text>
            </Column>
          </div>
          <Text variant="body-default-m" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "4px" }}>
            CHART does:
          </Text>
          <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
            <Column padding="24" vertical="center" horizontal="center" fillWidth>
              <Text variant="body-default-l" onBackground="neutral-medium" style={{ fontFamily: "monospace", lineHeight: "175%", textAlign: "center" }}>
                Query → Traverse multiple semantic paths → Land on leaves → Retrieve relational neighbors.
              </Text>
            </Column>
          </div>
          <div className={`${styles.chartCard} ${styles.tableCard}`} style={{ marginTop: "8px", marginBottom: "4px" }}>
            <div className={styles.comparisonTable}>
              <Table
                data={{
                  headers: [
                    { content: "ANN", key: "ann" },
                    { content: "CHART", key: "chart" }
                  ],
                  rows: [
                    ["distance-based", "relationship-based"],
                    ["flat", "topological"],
                    ["retrieves nearest neighbors", "retrieves meaningful connections"]
                  ]
                }}
              />
            </div>
          </div>
        </Column>
      </Column>
      <ScrollToHash />
    </Column>
  );
}

