import { Column, Table, Text } from "@once-ui-system/core";
import styles from "./ChartViz.module.scss";

const POINTS: [string, string][] = [
  ["Embeddings lie on a hypersphere", "Most embedding models normalize their outputs, so cosine similarity is the natural measure. For unit vectors, Euclidean distance ranks neighbors the same way, so the point is structure, not that distance is wrong."],
  ["HNSW works with cosine but builds no regions", "Its graph has no explicit angular partitions or region summaries."],
  ["CHART builds spherical caps (\"cones\")", "Spherical k-means splits the sphere into directional regions: wide angles for parents, narrow for children."],
  ["CHART adds a resolution dimension", "Its levels change the semantic scope of each node; HNSW's layers change only density."],
  ["Attention is an angular router", "Attention scores are dot products of projected embeddings, closely related to cosine similarity, so a transformer naturally compares directions."],
];

// CHART VS. HNSW: COMPARISON TABLE
export function HnswTable() {
  return (
    <div className={styles.tableWrap}>
      <Table
        data={{
          headers: [
            { content: "", key: "aspect" },
            { content: "HNSW", key: "hnsw" },
            { content: "CHART", key: "chart" },
          ],
          rows: [
            ["Hierarchy", "Randomly sampled layers of the same points", "Semantic clusters: each node is a region of meaning with a centroid"],
            ["Navigation", "Greedy hops using a fixed distance", "A transformer attends over a bounded frontier and learns which regions to expand"],
            ["Paths", "Greedy search with a candidate list", "Several branches expanded at once"],
            ["Goal", "Nearest neighbors by distance", "Related documents, even when they're far apart in embedding space"],
            ["Cost", "Very cheap per query, proven at scale", "A transformer pass per step (O(log N) steps), unproven"],
          ],
        }}
      />
    </div>
  );
}

// THE GEOMETRY ARGUMENT, COLLAPSED BY DEFAULT
export function GeometryArgument() {
  return (
    <div className={styles.detailsCard}>
      <Column padding="16" gap="s">
        <details>
          <summary style={{ cursor: "pointer", textAlign: "center" }}>
            <Text variant="body-default-l" onBackground="neutral-medium" style={{ lineHeight: "175%", fontStyle: "italic" }}>
              The geometry argument (technical): click to expand
            </Text>
          </summary>
          <Column gap="m" style={{ marginTop: "8px" }}>
            {POINTS.map(([title, body], k) => (
              <Column key={title} gap="xs">
                <Text variant="body-default-xl" onBackground="neutral-strong" style={{ lineHeight: "175%" }}>
                  {k + 1}. {title}
                </Text>
                <Text variant="body-default-l" onBackground="neutral-medium" style={{ lineHeight: "175%", paddingLeft: "16px" }}>
                  {body}
                </Text>
              </Column>
            ))}
            <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
              That&apos;s the design argument. Whether it pays off is what the experiments were meant to test.
            </Text>
          </Column>
        </details>
      </Column>
    </div>
  );
}
