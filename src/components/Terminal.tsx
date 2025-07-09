"use client";

import { useState, useEffect } from "react";
import { Column, Text } from "@once-ui-system/core";

const Terminal = () => {
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const commands = [
    "python train_model.py",
    "Model accuracy: 175% improvement over baseline",
    "deploy_to_nasa_systems",
    "Deployment successful! 🚀",
    "build_rag_system",
    "PB&J pipeline: parsing, betterment, JSON",
    "farm_agent --multi-layered",
    "RAG system operational",
    "git status",
    "All systems green ✅"
  ];

  useEffect(() => {
    const typeCommand = async () => {
      if (currentIndex >= commands.length) {
        setCurrentIndex(0);
        setCommandHistory([]);
        return;
      }

      const command = commands[currentIndex];
      setIsTyping(true);
      setCurrentCommand("");

      // Type out the command
      for (let i = 0; i <= command.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setCurrentCommand(command.slice(0, i));
      }

      setIsTyping(false);
      
      // Add to history
      setCommandHistory(prev => [...prev, command]);
      
      // Wait before next command
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 2000);
    };

    const interval = setInterval(typeCommand, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, commands]);

  return (
    <Column
      style={{
        background: 'var(--neutral-background-strong)',
        border: '1px solid var(--neutral-alpha-medium)',
        borderRadius: '8px',
        padding: '16px',
        fontFamily: 'Jersey 10, cursive',
        fontSize: '14px',
        lineHeight: '1.4',
        height: '300px',
        width: '400px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}
    >
      {/* Terminal Header */}
      <Text
        style={{
          color: 'var(--neutral-on-background-weak)',
          fontSize: '12px',
          marginBottom: '12px',
          borderBottom: '1px solid var(--neutral-alpha-medium)',
          paddingBottom: '8px'
        }}
      >
        dylan@portfolio:~$ terminal
      </Text>

      {/* Command History */}
      {commandHistory.map((cmd, index) => (
        <Text
          key={index}
          style={{
            color: 'var(--neutral-on-background-strong)',
            marginBottom: '4px'
          }}
        >
          <span style={{ color: 'var(--brand-on-background-strong)' }}>$</span> {cmd}
        </Text>
      ))}

      {/* Current Command */}
      <Text
        style={{
          color: 'var(--neutral-on-background-strong)'
        }}
      >
        <span style={{ color: 'var(--brand-on-background-strong)' }}>$</span> {currentCommand}
        {isTyping && (
          <span
            style={{
              color: 'var(--brand-on-background-strong)',
              animation: 'blink 1s infinite'
            }}
          >
            |
          </span>
        )}
      </Text>

      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </Column>
  );
};

export default Terminal; 