import React from "react";
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

  return (
    <Link href="/" style={{ textDecoration: "none" }}>
      <Flex
        gap={currentSize.gap}
        vertical="center"
        style={{ cursor: "pointer" }}
      >
        {/* Logo Icon */}
        <Flex
          background="brand-strong"
          radius="s"
          padding="4"
          vertical="center"
          horizontal="center"
          style={{
            width: currentSize.iconSize,
            height: currentSize.iconSize,
          }}
        >
          <Text
            variant="body-strong-s"
            onBackground="brand-strong"
            style={{
              fontSize: currentSize.fontSize === "14px" ? "12px" : currentSize.fontSize === "16px" ? "14px" : "16px",
              fontWeight: "700",
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