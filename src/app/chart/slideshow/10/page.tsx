"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";

export default function Slide10() {
  return (
    <SlideWrapper currentSlide={10} totalSlides={12}>
      <SlideContent
        title="Slide 10"
        subtitle="Subtitle for slide 10"
        contentBox1="Content Box 1"
        contentBox2="Content Box 2"
        takeaway="Takeaway"
      />
    </SlideWrapper>
  );
}
