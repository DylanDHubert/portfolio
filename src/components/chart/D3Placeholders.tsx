"use client";

import { Column, Text, Card } from "@once-ui-system/core";

// D3Visual1 is now in its own file: D3Visual1.tsx
export { D3Visual1 } from "./D3Visual1";

// D3Visual2 is now in its own file: D3Visual2.tsx
export { D3Visual2 } from "./D3Visual2";

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

