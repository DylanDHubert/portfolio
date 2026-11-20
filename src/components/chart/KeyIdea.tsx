import type { ReactNode } from "react";
import { Text } from "@once-ui-system/core";
import styles from "./ChartViz.module.scss";

// ONE HIGHLIGHTED SENTENCE: THE CORE IDEA OF THE POST
export function KeyIdea({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.keyIdea} ${styles.themed}`}>
      <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%" }}>
        {children}
      </Text>
    </div>
  );
}
