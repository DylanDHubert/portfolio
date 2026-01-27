"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";
import { Column, Text, Heading } from "@once-ui-system/core";

export default function Slide4() {
  return (
    <SlideWrapper currentSlide={4} totalSlides={12}>
      <SlideContent
        title="ATTENTION OVER EMBEDDINGS"
        subtitle="Why the Naive Approach Fails"
        contentBox1={
          <Column gap="s" fillWidth>
            <Heading variant="heading-strong-xl" style={{ fontSize: "1.25rem", lineHeight: "1.2", textAlign: "center" }}>
              the naive approach
            </Heading>
            <Column gap="xs" style={{ marginTop: "36px" }}>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                treat embeddings as tokens
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                run attention over the corpus
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                corpora have 10M–100M embeddings
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                self–attention is O(N²)
              </Text>
            </Column>
          </Column>
        }
        contentBox2={
          <Column gap="s" fillWidth>
            <Heading variant="heading-strong-xl" style={{ fontSize: "1.25rem", lineHeight: "1.2", textAlign: "center" }}>
              what&apos;s actually required
            </Heading>
            <Column gap="xs" style={{ marginTop: "36px" }}>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                coarse-to-fine reasoning
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                partial views of the corpus
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                fixed, bounded sequence length
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                predictable compute and memory
              </Text>
            </Column>
          </Column>
        }
        takeaway="TRAVERSAL MUST BE STRUCTURED AND BOUNDED TO BE FEASIBLE."
      />
    </SlideWrapper>
  );
}
