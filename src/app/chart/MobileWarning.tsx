"use client";

import { useState, useEffect } from "react";
import { Text, Button, Icon } from "@once-ui-system/core";
import styles from "./Chart.module.scss";

export function MobileWarning() {
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  // CHECK IF MOBILE WARNING HAS BEEN DISMISSED
  useEffect(() => {
    const dismissed = localStorage.getItem("chart-mobile-warning-dismissed");
    if (!dismissed) {
      // CHECK IF MOBILE
      const isMobile = window.innerWidth <= 768;
      setShowMobileWarning(isMobile);
    }
  }, []);

  const handleDismissWarning = () => {
    localStorage.setItem("chart-mobile-warning-dismissed", "true");
    setShowMobileWarning(false);
  };

  if (!showMobileWarning) return null;

  return (
    <div className={styles.mobileWarning}>
      <div className={styles.mobileWarningContent}>
        <div className={styles.mobileWarningIcon}>
          <Icon name="warning" size="xl" />
        </div>
        <Text variant="body-default-l" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center", margin: 0, fontWeight: 600 }}>
          Mobile View Notice
        </Text>
        <Text variant="body-default-m" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center", margin: "12px 0 0 0" }}>
          Some graphs may have trouble on mobile and are better viewed on desktop.
        </Text>
        <Button
          variant="tertiary"
          size="m"
          onClick={handleDismissWarning}
          style={{ marginTop: "24px" }}
        >
          Got it
        </Button>
      </div>
    </div>
  );
}

