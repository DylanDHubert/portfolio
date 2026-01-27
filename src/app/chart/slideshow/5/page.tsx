"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";
import { D3Visual1 } from "@/components/chart/D3Placeholders";
import { Column, Text, Heading } from "@once-ui-system/core";
import styles from "../../Chart.module.scss";

export default function Slide5() {
  return (
    <SlideWrapper currentSlide={5} totalSlides={12}>
      <SlideContent
        title="Hierarchical Clustering"
        subtitle="Adding Structure to Embedding Space"
        contentBox1={
          <Column gap="s" fillWidth>
            <Heading variant="heading-strong-xl" style={{ fontSize: "1.25rem", lineHeight: "1.2", textAlign: "center" }}>
              embedding tree
            </Heading>
            <Column gap="xs" style={{ marginTop: "36px" }}>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                angular similarity
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                leaves contain documents
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                parents store centroid embeddings
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                meaning organized at multiple scales
              </Text>
            </Column>
          </Column>
        }
        contentBox2={
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ transform: "scale(0.5)", transformOrigin: "center center", backgroundColor: "white", borderRadius: "16px", padding: "16px" }}>
              <D3Visual1 />
            </div>
          </div>
        }
        takeaway="BROAD TOPICS AT THE TOP, SPECIFIC CONCEPTS AT THE LEAVES."
      />
    </SlideWrapper>
  );
}
