"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";

export default function Slide12() {
  return (
    <SlideWrapper currentSlide={12} totalSlides={12}>
      <SlideContent
        title="Slide 12"
        subtitle="Subtitle for slide 12"
        contentBox1="Content Box 1"
        contentBox2="Content Box 2"
        takeaway="Takeaway"
      />
    </SlideWrapper>
  );
}
