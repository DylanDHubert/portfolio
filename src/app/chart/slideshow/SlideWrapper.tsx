"use client";

import { useRouter } from "next/navigation";
import { ToggleButton } from "@once-ui-system/core";
import headerStyles from "@/components/Header.module.scss";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SlideWrapperProps {
  currentSlide: number;
  totalSlides: number;
  children: React.ReactNode;
}

export function SlideWrapper({ currentSlide, totalSlides, children }: SlideWrapperProps) {
  const router = useRouter();
  
  const handlePrevious = () => {
    if (currentSlide > 1) {
      router.push(`/chart/slideshow/${currentSlide - 1}`);
    }
  };
  
  const handleNext = () => {
    if (currentSlide < totalSlides) {
      router.push(`/chart/slideshow/${currentSlide + 1}`);
    }
  };

  return (
    <>
      {/* NAVIGATION BUTTONS - TOP CORNERS - OUTSIDE MAIN CONTAINER TO AVOID Z-INDEX ISSUES */}
      <div style={{ position: "fixed", top: "48px", left: "48px", right: "48px", display: "flex", justifyContent: "space-between", zIndex: 9999, pointerEvents: "none" }}>
        <div style={{ pointerEvents: "auto" }}>
          <ToggleButton 
            prefixIcon="chevronLeft" 
            className={headerStyles.glowyNavButton} 
            onClick={handlePrevious}
            disabled={currentSlide === 1}
          />
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto" }}>
            <ThemeToggle />
          </div>
          <div style={{ pointerEvents: "auto" }}>
            <ToggleButton 
              prefixIcon="chevronRight" 
              className={headerStyles.glowyNavButton} 
              onClick={handleNext}
              disabled={currentSlide === totalSlides}
            />
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
