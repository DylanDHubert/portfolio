"use client";

import { useState, useEffect } from "react";
import { Text, Column } from "@once-ui-system/core";

export function ExpandableRedBox({ 
  collapsedContent, 
  expandedContent 
}: { 
  collapsedContent: React.ReactNode;
  expandedContent: React.ReactNode;
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    <div 
      style={{
        width: "100%",
        padding: "16px 20px",
        borderRadius: "8px",
        border: "1.5px solid rgba(239, 68, 68, 0.5)",
        backgroundColor: theme === 'light' ? '#fef2f2' : '#1f1515',
        color: theme === 'light' ? '#000' : '#fff',
        fontSize: "14px",
        lineHeight: "1.6",
        textAlign: "center",
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {!isExpanded ? collapsedContent : expandedContent}
    </div>
  );
}

