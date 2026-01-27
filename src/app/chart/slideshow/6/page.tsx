"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";
import { D3Visual2 } from "@/components/chart/D3Visual2_forslides";
import { Column, Text, Heading } from "@once-ui-system/core";
import styles from "../../Chart.module.scss";

export default function Slide6() {
  return (
    <SlideWrapper currentSlide={6} totalSlides={12}>
      <SlideContent
        title="Slide 6"
        subtitle="Subtitle for slide 6"
        contentBox1={
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ transform: "scale(0.5)", transformOrigin: "center center", backgroundColor: "white", borderRadius: "16px", padding: "16px" }}>
              <D3Visual2 mode="ANN" />
            </div>
          </div>
        }
        contentBox2={
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ transform: "scale(0.5)", transformOrigin: "center center", backgroundColor: "white", borderRadius: "16px", padding: "16px" }}>
              <D3Visual2 mode="CHART" />
            </div>
          </div>
        }
        takeaway="Takeaway"
      />
    </SlideWrapper>
  );
}
