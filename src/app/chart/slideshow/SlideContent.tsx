"use client";

import { useEffect } from "react";
import { Column, Heading, Text } from "@once-ui-system/core";
import styles from "../Chart.module.scss";

interface SlideContentProps {
  title: string;
  subtitle: string;
  contentBox1: React.ReactNode;
  contentBox2: React.ReactNode;
  takeaway: string;
}

export function SlideContent({ title, subtitle, contentBox1, contentBox2, takeaway }: SlideContentProps) {
  useEffect(() => {
    // HIDE HEADER AND FOOTER ON THIS PAGE
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const fadeElements = document.querySelectorAll("[data-fade]");
    
    if (header) {
      header.style.display = "none";
      header.style.pointerEvents = "none";
      header.style.zIndex = "-1";
    }
    if (footer) {
      footer.style.display = "none";
      footer.style.pointerEvents = "none";
      footer.style.zIndex = "-1";
    }
    
    // HIDE FADE OVERLAY ELEMENTS THAT MIGHT BLOCK
    fadeElements.forEach((el) => {
      (el as HTMLElement).style.display = "none";
      (el as HTMLElement).style.pointerEvents = "none";
      (el as HTMLElement).style.zIndex = "-1";
    });
    
    // PREVENT BODY SCROLLING
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    
    return () => {
      // RESTORE HEADER, FOOTER AND SCROLLING WHEN LEAVING PAGE
      if (header) {
        header.style.display = "";
        header.style.pointerEvents = "";
        header.style.zIndex = "";
      }
      if (footer) {
        footer.style.display = "";
        footer.style.pointerEvents = "";
        footer.style.zIndex = "";
      }
      fadeElements.forEach((el) => {
        (el as HTMLElement).style.display = "";
        (el as HTMLElement).style.pointerEvents = "";
        (el as HTMLElement).style.zIndex = "";
      });
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%", overflow: "hidden", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
      <Column className={styles.chartPage} as="section" maxWidth="m" horizontal="center" gap="0" style={{ height: "100%", width: "100%", padding: "24px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", boxSizing: "border-box", alignItems: "center", pointerEvents: "auto" }}>
        {/* TITLE */}
        <Heading variant="heading-strong-xl" style={{ fontSize: "2.5rem", lineHeight: "1.2", textAlign: "center", marginTop: "30px", marginBottom: "24px", flexShrink: 0, width: "100%", alignSelf: "center" }}>
          {title}
        </Heading>
        
        {/* SUBTITLE */}
        <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center", marginBottom: "24px", flexShrink: 0, width: "100%", alignSelf: "center" }}>
          {subtitle}
        </Text>
        
        {/* TWO CONTENT BOXES SIDE BY SIDE */}
        <div style={{ display: "flex", flexDirection: "row", gap: "24px", justifyContent: "center", alignItems: "stretch", width: "100%", flexShrink: 0, flex: "1 1 0", marginBottom: "24px" }}>
          <div className={styles.chartCard} style={{ flex: "1 1 0", minWidth: 0 }}>
            <Column padding="8" vertical="center" horizontal="center" fillWidth gap="s" style={{ height: "100%" }}>
              {typeof contentBox1 === "string" ? (
                <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center", fontSize: "2em" }}>
                  {contentBox1}
                </Text>
              ) : (
                contentBox1
              )}
            </Column>
          </div>
          <div className={styles.chartCard} style={{ flex: "1 1 0", minWidth: 0 }}>
            <Column padding="8" vertical="center" horizontal="center" fillWidth gap="s" style={{ height: "100%" }}>
              {typeof contentBox2 === "string" ? (
                <Text variant="body-default-xl" onBackground="neutral-medium" style={{ lineHeight: "175%", textAlign: "center", fontSize: "2em" }}>
                  {contentBox2}
                </Text>
              ) : (
                contentBox2
              )}
            </Column>
          </div>
        </div>
        
        {/* TAKEAWAY */}
        <div className={styles.chartCard} style={{ flexShrink: 0, marginTop: "auto", width: "100%", alignSelf: "center" }}>
          <Column padding="24" vertical="center" horizontal="center" fillWidth gap="s">
            <Heading variant="heading-strong-xl" style={{ fontSize: "1.25rem", lineHeight: "1.2", textAlign: "center" }}>
              {takeaway}
            </Heading>
          </Column>
        </div>
      </Column>
    </div>
  );
}
