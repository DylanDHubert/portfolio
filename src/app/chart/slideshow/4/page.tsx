"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";

export default function Slide4() {
  return (
    <SlideWrapper currentSlide={4} totalSlides={12}>
      <SlideContent
        title="Slide 4"
        subtitle="Subtitle for slide 4"
        contentBox1="Content Box 1"
        contentBox2="Content Box 2"
        takeaway="Takeaway"
      />
    </SlideWrapper>
  );
}
