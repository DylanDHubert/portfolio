"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";

export default function Slide9() {
  return (
    <SlideWrapper currentSlide={9} totalSlides={12}>
      <SlideContent
        title="Slide 9"
        subtitle="Subtitle for slide 9"
        contentBox1="Content Box 1"
        contentBox2="Content Box 2"
        takeaway="Takeaway"
      />
    </SlideWrapper>
  );
}
