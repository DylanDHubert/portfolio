"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";
import { SphereVisualization } from "@/components/chart/SphereVisualization";
import { SphereVisualization2 } from "@/components/chart/SphereVisualization2";

export default function Slide1() {
  return (
    <SlideWrapper currentSlide={1} totalSlides={12}>
      <SlideContent
        title="CHART"
        subtitle="Coarse–to–Fine Hierarchical Attention for Recursive Traversal"
        contentBox1={<SphereVisualization />}
        contentBox2={<SphereVisualization2 />}
        takeaway="semantic search as navigation through meaning"
      />
    </SlideWrapper>
  );
}
