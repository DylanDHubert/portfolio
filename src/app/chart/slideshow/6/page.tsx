"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";

export default function Slide6() {
  return (
    <SlideWrapper currentSlide={6} totalSlides={12}>
      <SlideContent
        title="Slide 6"
        subtitle="Subtitle for slide 6"
        contentBox1="Content Box 1"
        contentBox2="Content Box 2"
        takeaway="Takeaway"
      />
    </SlideWrapper>
  );
}
