"use client";

import { Column, Text, Card } from "@once-ui-system/core";

// PLACEHOLDER FOR D3 VISUAL 1: UMAP + depth slider
export function D3Visual1() {
  return (
    <Card padding="l" marginTop="24" marginBottom="24" border="neutral-medium">
      <Column gap="m" horizontal="center">
        <Text variant="body-default-l" onBackground="neutral-weak" style={{ fontStyle: "italic" }}>
          D3 Visual 1: UMAP + Depth Slider
        </Text>
        <Column
          style={{
            width: "100%",
            minHeight: "400px",
            backgroundColor: "var(--neutral-surface-weak)",
            borderRadius: "8px",
            border: "2px dashed var(--neutral-border-medium)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text variant="body-default-l" onBackground="neutral-weak" style={{ textAlign: "center" }}>
            A UMAP plot of the corpus with clusters highlighted,<br />
            and a slider that shows depth 0 → depth D.
          </Text>
        </Column>
      </Column>
    </Card>
  );
}

// PLACEHOLDER FOR D3 VISUAL 2: animated expansion
export function D3Visual2() {
  return (
    <Card padding="l" marginTop="24" marginBottom="24" border="neutral-medium">
      <Column gap="m" horizontal="center">
        <Text variant="body-default-l" onBackground="neutral-weak" style={{ fontStyle: "italic" }}>
          D3 Visual 2: Animated Tree Expansion
        </Text>
        <Column
          style={{
            width: "100%",
            minHeight: "400px",
            backgroundColor: "var(--neutral-surface-weak)",
            borderRadius: "8px",
            border: "2px dashed var(--neutral-border-medium)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text variant="body-default-l" onBackground="neutral-weak" style={{ textAlign: "center" }}>
            A simple tree where high-attention nodes expand<br />
            and low-attention nodes fade out.
          </Text>
        </Column>
      </Column>
    </Card>
  );
}

// PLACEHOLDER FOR D3 VISUAL 3: merge/split animation
export function D3Visual3() {
  return (
    <Card padding="l" marginTop="24" marginBottom="24" border="neutral-medium">
      <Column gap="m" horizontal="center">
        <Text variant="body-default-l" onBackground="neutral-weak" style={{ fontStyle: "italic" }}>
          D3 Visual 3: Merge/Split Animation
        </Text>
        <Column
          style={{
            width: "100%",
            minHeight: "400px",
            backgroundColor: "var(--neutral-surface-weak)",
            borderRadius: "8px",
            border: "2px dashed var(--neutral-border-medium)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text variant="body-default-l" onBackground="neutral-weak" style={{ textAlign: "center" }}>
            Animation showing nodes splitting when coherence is too low<br />
            and merging when coherence is too high.
          </Text>
        </Column>
      </Column>
    </Card>
  );
}

