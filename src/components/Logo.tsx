"use client";

import React, { useEffect, useState } from "react";
import { Flex, Text } from "@once-ui-system/core";
import Link from "next/link";

interface LogoProps {
  size?: "s" | "m" | "l";
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = "m", showText = true }) => {
  const sizeMap = {
    s: { fontSize: "14px", gap: "s" as const, iconSize: "24px" },
    m: { fontSize: "16px", gap: "m" as const, iconSize: "28px" },
    l: { fontSize: "20px", gap: "l" as const, iconSize: "32px" },
  };

  const currentSize = sizeMap[size];

  // Theme detection for logo color
  const [theme, setTheme] = useState<string | null>(null);
  useEffect(() => {
    const getTheme = () => {
      if (typeof document !== "undefined") {
        return document.documentElement.getAttribute("data-theme");
      }
      return null;
    };
    setTheme(getTheme());
    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const yellowGradient = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)';
  const turquoiseGradient = 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)';
  const background = theme === "light" ? turquoiseGradient : yellowGradient;
  const border = theme === "light" ? '1px solid rgba(6, 182, 212, 0.8)' : '1px solid rgba(251, 191, 36, 0.8)';
  const boxShadow = theme === "light"
    ? '0 0 8px rgba(6, 182, 212, 0.3), 0 0 15px rgba(6, 182, 212, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
    : '0 0 8px rgba(251, 191, 36, 0.3), 0 0 15px rgba(251, 191, 36, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.3)';

  return (
    <Link href="/" style={{ textDecoration: "none" }}>
      <Flex
        gap={currentSize.gap}
        vertical="center"
        style={{ cursor: "pointer" }}
      >
        {/* Logo Icon */}
        <Flex
          radius="s"
          padding="4"
          vertical="center"
          horizontal="center"
          style={{
            width: currentSize.iconSize,
            height: currentSize.iconSize,
            background,
            border,
            boxShadow,
          }}
        >
          <Text
            variant="body-strong-s"
            style={{
              fontSize: currentSize.fontSize === "14px" ? "12px" : currentSize.fontSize === "16px" ? "14px" : "16px",
              fontWeight: "700",
              color: 'rgba(255, 255, 255, 0.7)',
              textShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
            }}
          >
            DH
          </Text>
        </Flex>
        {/* Logo Text */}
        {showText && (
          <Text
            variant="body-strong-s"
            style={{
              fontSize: currentSize.fontSize,
              fontWeight: "600",
              letterSpacing: "-0.02em",
            }}
          >
            Dylan Hubert
          </Text>
        )}
      </Flex>
    </Link>
  );
}; 