"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";

export default function Slide3() {
  return (
    <SlideWrapper currentSlide={3} totalSlides={12}>
      <SlideContent
        title="Slide 3"
        subtitle="Subtitle for slide 3"
        contentBox1="Content Box 1"
        contentBox2="Content Box 2"
        takeaway="Takeaway"
      />
    </SlideWrapper>
  );
}
