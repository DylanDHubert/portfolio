"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";
import { Column, Text, Heading } from "@once-ui-system/core";

export default function Slide3() {
  return (
    <SlideWrapper currentSlide={3} totalSlides={12}>
      <SlideContent
        title="Two Priori"
        subtitle="Together, They Suggest a Different Kind of Retrieval"
        contentBox1={
          <Column gap="s" fillWidth>
            <Heading variant="heading-strong-xl" style={{ fontSize: "1.25rem", lineHeight: "1.2", textAlign: "center" }}>
              embeddings are meaningful
            </Heading>
            <Column gap="xs" style={{ marginTop: "36px" }}>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                learned from massive corpora
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                capture meaning beyond keywords
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                related concepts near each other
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                power most modern retrieval systems
              </Text>
            </Column>
          </Column>
        }
        contentBox2={
          <Column gap="s" fillWidth>
            <Heading variant="heading-strong-xl" style={{ fontSize: "1.25rem", lineHeight: "1.2", textAlign: "center" }}>
              transformers learn relationships
            </Heading>
            <Column gap="xs" style={{ marginTop: "36px" }}>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                self–attention compares elements directly
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                learns context, structure, and dependency
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                understands relational patterns
              </Text>
              <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", fontSize: "1.5em", textAlign: "center" }}>
                scales with model capacity
              </Text>
            </Column>
          </Column>
        }
        takeaway={
          <>
            IF EMBEDDINGS HOLD MEANING, AND ATTENTION LEARNS RELATIONSHIPS
            <br />
            CAN A MODEL LEARN TO TRAVERSE EMBEDDING SPACE?
          </>
        }
      />
    </SlideWrapper>
  );
}
