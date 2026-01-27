"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";

export default function Slide11() {
  return (
    <SlideWrapper currentSlide={11} totalSlides={12}>
      <SlideContent
        title="Slide 11"
        subtitle="Subtitle for slide 11"
        contentBox1="Content Box 1"
        contentBox2="Content Box 2"
        takeaway="Takeaway"
      />
    </SlideWrapper>
  );
}
