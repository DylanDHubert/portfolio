import { Column, Heading, Text, Meta, Schema, Button, Card, InlineCode, Table } from "@once-ui-system/core";
import { baseURL, person, blog } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { ScrollToHash } from "@/components";
import { D3Visual1, D3Visual2, D3Visual3 } from "@/components/chart/D3Placeholders";
import styles from "./Chart.module.scss";
import { ThemeAwareRedBox } from "./ThemeAwareRedBox";
import { ThemeAwareGreenBox } from "./ThemeAwareGreenBox";
import { MobileWarning } from "./MobileWarning";

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
  const publishedAt = "2025-11-17"; // UPDATE THIS WHEN PUBLISHING

  // COMPREHENSIVE BLOG POST STRUCTURED DATA FOR AI ACCESSIBILITY
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "CHART: Coarse-to-Fine Hierarchical Attention for Recursive Traversal",
    "alternativeHeadline": "C.H.A.R.T. - Coarse-to-Fine Hierarchical Attention for Recursive Traversal",
    "description": "A transformer-based approach to embedding search that learns to traverse hierarchical semantic trees, enabling relationship-based retrieval instead of distance-based nearest neighbor search. CHART uses coarse-to-fine traversal with a fixed-size attention window to navigate embedding space in O(log N) time.",
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
    "image": `/api/og/generate?title=${encodeURIComponent("CHART: Coarse-to-Fine Hierarchical Attention for Recursive Traversal")}`,
    "articleSection": "Machine Learning & AI",
    "keywords": [
      "machine learning", 
      "transformers", 
      "embedding search", 
      "RAG", 
      "vector search", 
      "semantic search", 
      "attention mechanisms",
      "hierarchical clustering",
      "coarse-to-fine traversal",
      "relationship-based retrieval",
      "neural information retrieval",
      "transformer architecture",
      "embedding space navigation"
    ],
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
      },
      {
        "@type": "Thing",
        "name": "Hierarchical Clustering"
      },
      {
        "@type": "Thing",
        "name": "Attention Mechanisms"
      },
      {
        "@type": "Thing",
        "name": "Semantic Search"
      }
    ],
    "isPartOf": {
      "@type": "Blog",
      "name": `${person.name}'s Blog`,
      "url": `${baseURL}${blog.path}`
    },
    "mainEntity": {
      "@type": "ResearchProject",
      "name": "CHART",
      "description": "A transformer-based embedding search system that learns to traverse hierarchical semantic trees using coarse-to-fine attention mechanisms"
    }
  };

  return (
    <Column className={styles.chartPage} as="section" maxWidth="m" horizontal="center" gap="l">
      {/* MOBILE WARNING POPUP */}
      <MobileWarning />
      
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
        title="CHART: Coarse-to-Fine Heirarchical Attention for Recursive Traversal"
        description="A transformer-based approach to embedding search that learns to traverse hierarchical semantic trees"
        datePublished={publishedAt}
        dateModified={publishedAt}
        image={`/api/og/generate?title=${encodeURIComponent("CHART: Coarse-to-Fine Heirarchical Attention for Recursive Traversal")}`}
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
        <Heading variant="display-strong-m">C.H.A.R.T.<br />Coarse-to-Fine Heirarchical Attention for Recursive Traversal</Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          {formatDate(publishedAt)}
        </Text>
      </Column>

      <Column className={styles.mobileContent} style={{ margin: "auto" }} as="article" maxWidth="s" gap="m">
        {/* INTRODUCTION */}
        <Column gap="s">
          <Heading as="h2" variant="heading-strong-xl" style={{ marginTop: "12px", marginBottom: "6px" }}>
            Introduction — Two Priors
          </Heading>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            This project rests on two priors that, when combined, point to a very natural architectural idea.
          </Text>
          
          {/* Two inline boxes for the two priors */}
          <div className={styles.twoPriorBoxes} style={{ display: "flex", gap: "12px", marginTop: "12px", marginBottom: "8px" }}>
            <div className={styles.chartCard} style={{ flex: 1 }}>
              <Column padding="24" vertical="center" horizontal="center" fillWidth gap="4">
                <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center", fontWeight: "bold" }}>
                  EMBEDDINGS
                </Text>
                <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                  contain real semantic information.
                </Text>
              </Column>
            </div>
            <div className={styles.chartCard} style={{ flex: 1 }}>
              <Column padding="24" vertical="center" horizontal="center" fillWidth gap="4">
                <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center", fontWeight: "bold" }}>
                  TRANSFORMERS
                </Text>
                <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                  learn relationships.
                </Text>
              </Column>
            </div>
          </div>
          
          <Column gap="s" style={{ marginTop: "8px" }}>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              However, there is an issue with embeddings:
            </Text>
            <ThemeAwareRedBox>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center", margin: 0 }}>
                Embeddings do not tell you how concepts relate, only how far apart they are.
                There is no hierarchy, no paths, no structure. Only distances.
              </Text>
            </ThemeAwareRedBox>
          </Column>

          <Column gap="s" style={{ marginTop: "8px" }}>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              Self-attention is fundamentally a learned relational operator.
            </Text>
          </Column>

          <div className={styles.chartCard} style={{ marginTop: "8px", marginBottom: "4px" }}>
            <Column padding="24" vertical="center" horizontal="center" fillWidth gap="4">
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%", textAlign: "center" }}>TOGETHER</Text>
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                If embeddings hold meaning, and attention learns relationships, <br />
                Can a transformer learn to traverse embedding space?
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                This is the seed of CHART.
              </Text>
            </Column>
          </div>
          
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "8px" }}>
            But a problem remains:
          </Text>
          <ThemeAwareRedBox>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center", margin: 0 }}>
              You cannot simply run attention directly over your entire embedding database.
            </Text>
          </ThemeAwareRedBox>
        </Column>

        {/* THE OBVIOUS PROBLEM */}
        <Column gap="s">
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            A corpus might have <InlineCode>10M–100M</InlineCode> embeddings. Self-attention is <InlineCode>O(N²)</InlineCode>.
          </Text>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            So the naive idea — &quot;just run a transformer over the embeddings&quot; — is effectively impossible.
          </Text>
          
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "8px" }}>
            We need a way to:
          </Text>
          <Column as="ul" gap="xs" style={{ listStyle: "none", paddingLeft: "0", marginTop: "4px" }}>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + Work at coarse scales first
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + Narrow into fine scales
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + Keep the sequence length (input size) bounded
            </Text>
          </Column>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "4px" }}>
            THIS LEADS TO THE STRUCTURAL INSIGHT.
          </Text>
        </Column>

        {/* ORGANIZING THE EMBEDDING SPACE */}
        <Column gap="s">
          <Heading as="h2" variant="heading-strong-xl" style={{ marginTop: "12px", marginBottom: "6px" }}>
            HEIRARCHY: Organizing the Embedding Space Into a Tree
          </Heading>
          <ThemeAwareGreenBox>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center", margin: 0 }}>
              If we pre-organize the corpus into a tree, we can traverse coarse-to-fine without ever loading the full dataset.
            </Text>
          </ThemeAwareGreenBox>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            The tree is built very simply:
          </Text>
          <Column as="ul" gap="xs" style={{ listStyle: "none", paddingLeft: "0", marginTop: "4px" }}>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + Recursively cluster the embeddings... <InlineCode>k₀ = 2</InlineCode>.
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + Leaves contain chunks/documents.
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + Parents contain centroid embeddings (mean of children).
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + Higher parents contain means of means, recursively.
            </Text>
          </Column>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "4px" }}>
            THIS GIVES A NATURAL MULTISCALE STRUCTURE.
          </Text>

          {/* D3 VISUAL 1 */}
          <div className={styles.d3Wrapper}>
            <D3Visual1 />
          </div>
        </Column>

        {/* TRAVERSAL */}
        <Column gap="s">
          <Heading as="h2" variant="heading-strong-xl" style={{ marginTop: "12px", marginBottom: "6px" }}>
            TRAVERSAL: How the Transformer Maintains Sequence Length
          </Heading>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            We must keep the transformer&apos;s context fixed regardless of corpus size.
          </Text>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "8px" }}>
            CHART does this by maintaining a fixed-size active set:
          </Text>
          <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
            <Column padding="24" vertical="center" horizontal="center" fillWidth>
              <Column as="ul" gap="xs" style={{ listStyle: "none", paddingLeft: "0", margin: 0, width: "100%" }}>
                <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
                  + Start with <InlineCode>max(K₀, max_seq_len)</InlineCode> root nodes with tokens being the embedding (centroids).
                </Text>
                <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
                  + Run one encoder forward pass.
                </Text>
                <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
                  + Compute attention scores over these nodes.
                </Text>
                <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
                  + Expand only the top <InlineCode>α</InlineCode> fraction (<InlineCode>α ≈ 0.25</InlineCode>).
                </Text>
                <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
                  + Replace each expanded node with its children (K<sub>DEPTH</sub> children).
                </Text>
                <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
                  + Remove lowest attention nodes to reduce sequence length back to <InlineCode>max_seq_len</InlineCode> for the next step.
                </Text>
              </Column>
            </Column>
          </div>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "8px" }}>
            This creates a bounded attention window, EXAMPLE:
          </Text>
          <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
            <Column padding="24" vertical="center" horizontal="center" fillWidth>
              <Text variant="body-default-l" onBackground="neutral-medium" style={{ fontFamily: "monospace", lineHeight: "175%", textAlign: "center" }}>
                STEP 0: <InlineCode>64</InlineCode> root nodes<br />
                STEP 1: Expand <InlineCode>16</InlineCode>: replace with the <InlineCode>32</InlineCode> children, then remove <InlineCode>16</InlineCode> low attention nodes.<br />
                ...<br />
                STEP N: Expand <InlineCode>16</InlineCode>: replace with the <InlineCode>32</InlineCode> children, then remove <InlineCode>16</InlineCode> low attention nodes.<br />
                STOP: When nodes are stable in the input sequence, or all nodes are leaves. <br />
                MAX STEPS: <InlineCode>LogK₀(N)</InlineCode>.
              </Text>
            </Column>
          </div>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "4px" }}>
            STRUCTURE IS NEVER FULLY LOADED — ONLY THE FRONTIER.
          </Text>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            THIS IS CHART&apos;S CORE COMPUTATIONAL TRICK.
          </Text>

          {/* D3 VISUAL 2 */}
          <div className={styles.d3Wrapper}>
            <D3Visual2 />
          </div>
        </Column>

        {/* TRAINING */}
        <Column gap="xs">
          <Heading as="h2" variant="heading-strong-xl" style={{ marginTop: "12px", marginBottom: "4px" }}>
            TRAININGs: A Three-Stage Curriculum
          </Heading>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            Three stages build from basic localization to relational reasoning to embedding-space refinement. <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>The transformer never learns to manage sequence length</Text>— we enforce a fixed-size frontier at every step; the model only learns to navigate within that bounded set.
          </Text>

          <Column gap="xs" style={{ marginTop: "4px" }}>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>A. Localization:</Text> Descend the hierarchy to locate a single document. Teaches basic tree geometry: given an embedding, find the correct coarse-to-fine route. No multi-path reasoning yet.
            </Text>
            <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
              <Column padding="24" vertical="center" horizontal="center" fillWidth>
                <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                  Find correct coarse–to–fine path to locate query document. Single–Target BCE.
                </Text>
              </Column>
            </div>
          </Column>

          <Column gap="xs" style={{ marginTop: "4px" }}>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>B. Relational Localization:</Text> Generalize to find a document and its related documents. Teaches semantic routing: explore multiple paths toward meaningful neighbors. Traversal becomes reasoning, not just following.
            </Text>
            <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
              <Column padding="24" vertical="center" horizontal="center" fillWidth>
                <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                  Explore multiple paths to locate query and related documents. Multi–Target BCE.
                </Text>
              </Column>
            </div>
          </Column>

          <Column gap="xs" style={{ marginTop: "4px" }}>
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>C. Embedding Refinement:</Text> Close the loop by reshaping embedding space so learned paths become easier and more coherent. After updating embeddings: recompute coherence for affected leaf clusters only, split inconsistent clusters, merge overly tight ones, update centroids upward, leave rest untouched. Results in a self-correcting hierarchy that aligns with discovered relationships.
            </Text>
            <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
              <Column padding="24" vertical="center" horizontal="center" fillWidth>
                <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center" }}>
                  Reshape the embedding space for a more meaningful heirarchical structure. InfoNCE.
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
                A transformer that traverses embedding space in <InlineCode>O(LogK₀(N))</InlineCode> time,
                learning relationships between distant but semantically related embeddings.
              </Text>
            </Column>
          </div>
        </Column>

        {/* WHY THIS MATTERS */}
        <Column gap="s">
          <Heading as="h2" variant="heading-strong-xl" style={{ marginTop: "12px", marginBottom: "6px" }}>
            Why This Matters
          </Heading>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            TRADITIONAL VECTOR SEARCH DOES:
          </Text>
          <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
            <Column padding="24" vertical="center" horizontal="center" fillWidth>
              <Text variant="body-default-l" onBackground="neutral-medium" style={{ fontFamily: "monospace", lineHeight: "175%", textAlign: "center" }}>
                Query. ANN. Top-K. Rerank.
              </Text>
            </Column>
          </div>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "4px" }}>
            CHART DOES:
          </Text>
          <div className={styles.chartCard} style={{ marginTop: "4px", marginBottom: "4px" }}>
            <Column padding="24" vertical="center" horizontal="center" fillWidth>
              <Text variant="body-default-l" onBackground="neutral-medium" style={{ fontFamily: "monospace", lineHeight: "175%", textAlign: "center" }}>
                Query. Traverse Multiple Semantic Paths. Land on Leaves. Retrieve Relational Neighbors.
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

        {/* NEXT STEPS */}
        <Column gap="s">
          <Heading as="h2" variant="heading-strong-xl" style={{ marginTop: "12px", marginBottom: "6px" }}>
            Next Steps
          </Heading>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
            I&apos;ve written the core codebase, built two datasets (the first of which turned out to be a dead end), and I&apos;m now running the initial training and evaluation loops.
          </Text>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "8px" }}>
            The next post will walk through:
          </Text>
          <Column as="ul" gap="xs" style={{ listStyle: "none", paddingLeft: "0", marginTop: "4px" }}>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + Dataset Construction
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + Current Implementation & Code
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + AND what the first round of results taught me— including the failed attempts and how they&apos;re shaping the next iteration.
            </Text>
          </Column>
          <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", marginTop: "8px" }}>
            This post also leaves out a few technical details that deserve their own focused explanation. In the follow-up, I&apos;ll cover:
          </Text>
          <Column as="ul" gap="xs" style={{ listStyle: "none", paddingLeft: "0", marginTop: "4px" }}>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>SEEDING THE ATTENTION WINDOW</Text>: how the initial sequence is fully populated, and how the query embedding is integrated so the model starts with a complete, fixed-length token set
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>EMBEDDINGS AS TOKENS</Text>: the projection layers and tokenization strategy that allow raw embeddings to function as transformer inputs
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>TRAINING DYNAMICS</Text>: curriculum scheduling, stage-wise loss weighting, and stabilization during early training
            </Text>
            <Text as="li" variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              + <Text as="span" variant="body-default-xl" onBackground="brand-strong" style={{ lineHeight: "175%" }}>EVALUATION METRICS</Text>: measuring success beyond retrieval accuracy, including traversal interpretability and hierarchy coherence
            </Text>
          </Column>
        </Column>

        {/* FOOTER NOTE */}
        <Column gap="s">
          <Text variant="body-default-m" onBackground="neutral-weak" style={{ lineHeight: "175%", textAlign: "center", marginTop: "24px" }}>
            SOCIALS ARE IN THE FOOTER IF YOU WANT TO FOLLOW ALONG.
          </Text>
        </Column>
      </Column>
      <ScrollToHash />
    </Column>
  );
}

