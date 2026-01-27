"use client";

import { SlideContent } from "../SlideContent";
import { SlideWrapper } from "../SlideWrapper";

export default function Slide7() {
  return (
    <SlideWrapper currentSlide={7} totalSlides={12}>
      <SlideContent
        title="Slide 7"
        subtitle="Subtitle for slide 7"
        contentBox1="Content Box 1"
        contentBox2="Content Box 2"
        takeaway="Takeaway"
      />
    </SlideWrapper>
  );
}
