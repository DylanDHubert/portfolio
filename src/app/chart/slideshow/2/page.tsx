"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";
import { Column, Text, Heading } from "@once-ui-system/core";

export default function Slide2() {
  return (
    <SlideWrapper currentSlide={2} totalSlides={12}>
      <SlideContent
        title="THE ISSUE WITH EMBEDDINGS"
        subtitle="Distance Captures Similarity (NOT Structure)"
        contentBox1={
          <Column gap="s" fillWidth>
            <Heading variant="heading-strong-xl" style={{ fontSize: "1.25rem", lineHeight: "1.2", textAlign: "center" }}>
              embeddings work well because:
            </Heading>
            <Column gap="xs" style={{ marginTop: "36px" }}>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                encode semantic similarity
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                cosine distance is meaningful
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                local neighborhoods make sense
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                nearest neighbors are extremely useful
              </Text>
            </Column>
          </Column>
        }
        contentBox2={
          <Column gap="s" fillWidth>
            <Heading variant="heading-strong-xl" style={{ fontSize: "1.25rem", lineHeight: "1.2", textAlign: "center" }}>
              but ANN cannot directly leverage:
            </Heading>
            <Column gap="xs" style={{ marginTop: "36px" }}>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                hierarchy (organization)
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                paths or relationships
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                directionality
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                scale or abstraction
              </Text>
            </Column>
          </Column>
        }
        takeaway="embeddings do not tell you how concepts relate, only how far apart they are."
      />
    </SlideWrapper>
  );
}
