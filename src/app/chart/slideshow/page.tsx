"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SlideshowPage() {
  const router = useRouter();
  
  useEffect(() => {
    // REDIRECT TO FIRST SLIDE
    router.replace("/chart/slideshow/1");
  }, [router]);

  return null;
}
