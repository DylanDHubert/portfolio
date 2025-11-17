"use client";

import { useState, useEffect } from "react";

export function ThemeAwareGreenBox({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // Track theme changes
  useEffect(() => {
    const updateTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(currentTheme as 'light' | 'dark');
    };
    
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
      width: "100%",
      padding: "16px 20px",
      borderRadius: "8px",
      border: "1.5px solid rgba(34, 197, 94, 0.5)",
      backgroundColor: theme === 'light' ? '#f0fdf4' : '#0f1f15',
      color: theme === 'light' ? '#000' : '#fff',
      fontSize: "14px",
      lineHeight: "1.6",
      textAlign: "center",
    }}>
      {children}
    </div>
  );
}

