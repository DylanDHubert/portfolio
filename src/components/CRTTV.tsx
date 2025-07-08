"use client";

import React, { useState, useRef, useEffect } from "react";
import { Column, Row, Text, Button, Input, Icon } from "@once-ui-system/core";
import styles from "./CRTTV.module.scss";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

interface ToolCall {
  id: string;
  type: 'navigate' | 'open_project' | 'open_blog' | 'show_music' | 'show_gallery';
  data: any;
  executed: boolean;
}

interface CRTTVProps {
  onNavigate?: (path: string) => void;
  onOpenProject?: (project: string) => void;
  onOpenBlog?: (slug: string) => void;
}

const CRTTV: React.FC<CRTTVProps> = ({ onNavigate, onOpenProject, onOpenBlog }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. I know everything about Dylan's background, projects, and experience. Ask me anything! I can also help you navigate around his portfolio.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [isBooting, setIsBooting] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [bootMessage, setBootMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Temporarily disabled to test layout stability
    // messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const executeToolCall = (toolCall: ToolCall) => {
    switch (toolCall.type) {
      case 'navigate':
        if (onNavigate) {
          onNavigate(toolCall.data.path);
        } else {
          window.location.href = toolCall.data.path;
        }
        break;
      case 'open_project':
        if (onOpenProject) {
          onOpenProject(toolCall.data.project);
        } else {
          window.location.href = `/websites/${toolCall.data.project}`;
        }
        break;
      case 'open_blog':
        if (onOpenBlog) {
          onOpenBlog(toolCall.data.slug);
        } else {
          window.location.href = `/blog/${toolCall.data.slug}`;
        }
        break;
      case 'show_music':
        if (onNavigate) {
          onNavigate('/music');
        } else {
          window.location.href = '/music';
        }
        break;
      case 'show_gallery':
        if (onNavigate) {
          onNavigate('/gallery');
        } else {
          window.location.href = '/gallery';
        }
        break;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Try to use the API route first
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          temperature,
          topP,
          maxTokens
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
          toolCalls: data.toolCalls
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Execute tool calls if any
        if (data.toolCalls) {
          data.toolCalls.forEach((toolCall: ToolCall) => {
            setTimeout(() => executeToolCall(toolCall), 500);
          });
        }
      } else {
        // Fallback to local logic if API fails
        const response = generateAIResponse(inputValue);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          toolCalls: response.toolCalls
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Execute tool calls if any
        if (response.toolCalls) {
          response.toolCalls.forEach(toolCall => {
            setTimeout(() => executeToolCall(toolCall), 500);
          });
        }
      }
    } catch (error) {
      // Fallback to local logic if API fails
      const response = generateAIResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        toolCalls: response.toolCalls
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Execute tool calls if any
      if (response.toolCalls) {
        response.toolCalls.forEach(toolCall => {
          setTimeout(() => executeToolCall(toolCall), 500);
        });
      }
    }
    
    setIsLoading(false);
  };

  const generateAIResponse = (userInput: string): { content: string; toolCalls?: ToolCall[] } => {
    const input = userInput.toLowerCase();
    
    // RAG-like responses based on Dylan's content with tool calls
    if (input.includes('show me') && input.includes('project')) {
      if (input.includes('machinterview')) {
        return {
          content: `I'll show you the machinterview project! This is a live mock interview AI agent that helps people practice technical interviews in real-time.`,
          toolCalls: [{
            id: Date.now().toString(),
            type: 'open_project',
            data: { project: 'machinterview' },
            executed: false
          }]
        };
      }
      if (input.includes('eudaemonia')) {
        return {
          content: `I'll show you the eudaemonia project! This is a personal wellness tracker that helps users monitor their mental and physical health.`,
          toolCalls: [{
            id: Date.now().toString(),
            type: 'open_project',
            data: { project: 'eudaemonia-wellness' },
            executed: false
          }]
        };
      }
    }

    if (input.includes('show me') && input.includes('music')) {
      return {
        content: `I'll show you Dylan's music! He's a self-taught music producer and has created various tracks.`,
        toolCalls: [{
          id: Date.now().toString(),
          type: 'show_music',
          data: {},
          executed: false
        }]
      };
    }

    if (input.includes('show me') && input.includes('gallery')) {
      return {
        content: `I'll show you Dylan's gallery! He creates art with markers and paper.`,
        toolCalls: [{
          id: Date.now().toString(),
          type: 'show_gallery',
          data: {},
          executed: false
        }]
      };
    }

    if (input.includes('go to') && input.includes('about')) {
      return {
        content: `I'll take you to Dylan's about page where you can learn more about his background and experience.`,
        toolCalls: [{
          id: Date.now().toString(),
          type: 'navigate',
          data: { path: '/about' },
          executed: false
        }]
      };
    }

    if (input.includes('project') || input.includes('work') || input.includes('build')) {
      return {
        content: `I've worked on several interesting projects! Here are some highlights:

**machinterview** - A live mock interview AI agent that helps people practice technical interviews in real-time.

**eudaemonia** - A personal wellness tracker that helps users monitor their mental and physical health.

**NASA Research** - I've done two internships at NASA Goddard Space Flight Center:
- Time Series Forecasting: Achieved 175% improvement in Total Solar Irradiance prediction
- 3D Cloud Reconstruction: Built models for atmospheric density prediction

**RAG Systems** - At The Pitch Place, I built PB&J (Peanut-Butter-Jelly) document processing pipeline and Farm, a conversational RAG agent.

You can ask me to "show me the machinterview project" or "show me the eudaemonia project" to see more details!`
      };
    }

    if (input.includes('nasa') || input.includes('space') || input.includes('satellite')) {
      return {
        content: `My NASA experience has been incredible! I've worked on two different projects:

**Time Series Forecasting (2023)**: I developed a CNN-Informer hybrid architecture that achieved 175% improvement in Total Solar Irradiance (TSI) prediction using HMI disk images. This was for space weather forecasting.

**3D Cloud Reconstruction (2024)**: I worked on reconstructing 3D cloud models using perpendicular 2D views from GOES ABI top-down imagery and CloudSat side-view slices. This involved transfer learning between satellite platforms and pre-training large visual models.

Both projects used NASA's supercomputing facilities and involved cutting-edge machine learning techniques. The work was published and contributed to NASA's research initiatives.`
      };
    }

    if (input.includes('rag') || input.includes('retrieval') || input.includes('chatbot')) {
      return {
        content: `I've built several production RAG systems! Here's what I've worked on:

**At The Pitch Place**: 
- PB&J Pipeline: A three-phase document processing system (parsing, betterment, JSON transformation)
- Farm Agent: A conversational RAG with multi-layered decision logic
- Handled highly technical, table-heavy PDFs with domain-agnostic processing

**At Stryker MedTech**:
- Built an internal RAG chatbot for orthopedic implant documentation
- Integrated PDF highlighting and vector search (OpenAI + LlamaIndex)
- Full Q&A UI for medical device compliance

These systems handle real-world, messy data and are deployed in production environments.`
      };
    }

    if (input.includes('background') || input.includes('education') || input.includes('degree')) {
      return {
        content: `I'm a Machine Learning Engineer and Full Stack Developer with a strong academic foundation:

**Education**: Bachelor of Science in Computer Science from American University (2021-2025)
- GPA: 3.82, Cum Laude
- Dean's List Six Semesters
- Teaching Assistant for Introduction to Machine Learning & Computer Systems
- Mentored by Dr. Leah Ding

**Journey**: Started with Python turtle graphics drawing polygons - a simple project that captured my passion for creating things that bridge the gap between ideas and reality.

**Philosophy**: I believe in combining intellectual depth with practical impact, always seeking projects that are both technologically fascinating and genuinely useful.

You can ask me to "go to about" to see more details about my background!`
      };
    }

    if (input.includes('music') || input.includes('art') || input.includes('hobby')) {
      return {
        content: `Outside of coding, I have several creative pursuits:

**Music**: I'm a self-taught music producer and have created various tracks. You can ask me to "show me music" to check it out!

**Art**: I create art with markers and paper - it's a great way to express creativity outside of code. You can ask me to "show me gallery" to see some of my artwork.

**Philosophy**: I practice Taoist philosophy, which influences my approach to both life and technology.

**Physical Activities**: I enjoy soccer, cycling, hiking, and even baking bread. There's something meditative about the process of baking.

These activities help me maintain balance and bring fresh perspectives to my technical work.`
      };
    }

    if (input.includes('contact') || input.includes('email') || input.includes('reach')) {
      return {
        content: `You can reach me through several channels:

**Email**: dylandhubert@outlook.com
**LinkedIn**: https://www.linkedin.com/in/dylan-hubert-a6ba63310/
**GitHub**: https://github.com/DylanDHubert

I'm always open to discussing interesting projects, collaborations, or just chatting about technology and AI!`
      };
    }

    // Default response
    return {
      content: `That's an interesting question! I know a lot about Dylan's background, projects, and experience. You could ask me about:

- His projects (machinterview, eudaemonia, NASA work, RAG systems)
- His background and education
- His work experience at NASA, The Pitch Place, and Stryker
- His hobbies and interests (music, art, philosophy)
- How to contact him

You can also ask me to:
- "Show me the machinterview project"
- "Show me the eudaemonia project" 
- "Show me music"
- "Show me gallery"
- "Go to about"

What would you like to know more about?`
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePowerToggle = () => {
    if (isPoweredOn && !isShuttingDown) {
      // Shutdown sequence
      setIsShuttingDown(true);
      setBootMessage("SHUTTING DOWN...");
      
      setTimeout(() => {
        setIsPoweredOn(false);
        setIsShuttingDown(false);
        setBootMessage("");
      }, 2000);
    } else if (!isPoweredOn && !isBooting) {
      // Boot sequence
      setIsBooting(true);
      setBootMessage("BOOTING SYSTEM...");
      
      setTimeout(() => {
        setIsPoweredOn(true);
        setIsBooting(false);
        setBootMessage("");
      }, 3000);
    }
  };

  return (
    <div className={styles.crtContainer}>
      {/* CRT TV Frame */}
      <div className={styles.crtFrame}>
        {/* TV Screen */}
        <div className={`${styles.screen} ${
          !isPoweredOn ? styles.poweredOff : 
          isBooting ? styles.booting : 
          isShuttingDown ? styles.shuttingDown : ''
        }`}>
          {/* Scan Lines Effect */}
          {isPoweredOn && <div className={styles.scanLines}></div>}
          
          {/* Boot/Shutdown Message */}
          {(isBooting || isShuttingDown) && (
            <div className={styles.bootMessage}>
              {bootMessage}
            </div>
          )}
          
          {/* Chat Interface */}
          {isPoweredOn && !isBooting && !isShuttingDown && (
            <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
              <Text 
                variant="body-strong-s" 
                onBackground="brand-strong"
                style={{ 
                  fontFamily: 'Courier New, monospace',
                  fontWeight: 'bold',
                  fontSize: '10px'
                }}
              >
                AI Assistant v1.0 - Dylan's Portfolio RAG
              </Text>
            </div>
            
            <div className={styles.messagesContainer}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${styles[message.role]}`}
                >
                  <div className={styles.messageContent}>
                    <Text 
                      variant="body-default-s" 
                      style={{ 
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'Courier New, monospace',
                        fontSize: '10px'
                      }}
                    >
                      {message.content}
                    </Text>
                  </div>
                  <div className={styles.messageTime}>
                    <Text 
                      variant="body-default-xs" 
                      onBackground="neutral-weak"
                      style={{ 
                        fontFamily: 'Courier New, monospace',
                        fontSize: '8px'
                      }}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </Text>
                  </div>
                  
                  {/* Tool Call Buttons */}
                  {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className={styles.toolCalls}>
                      {message.toolCalls.map((toolCall) => (
                        <Button
                          key={toolCall.id}
                          onClick={() => executeToolCall(toolCall)}
                          variant="secondary"
                          size="s"
                          className={styles.toolCallButton}
                        >
                          {toolCall.type === 'open_project' && 'View Project'}
                          {toolCall.type === 'navigate' && 'Navigate'}
                          {toolCall.type === 'show_music' && 'Open Music'}
                          {toolCall.type === 'show_gallery' && 'Open Gallery'}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className={styles.inputContainer}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="ASK ME ANYTHING ABOUT DYLAN, HIS PROJECTS, EXPERIENCE, ETC. (OR THIS WEBSITE!)"
                className={styles.chatInput}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={styles.sendButton}
                variant="secondary"
                size="s"
              >
                <Icon name="send" />
              </Button>
            </div>
          </div>
          )}
        </div>
        
        {/* TV Controls */}
        <div className={styles.controls}>
          {/* Power Button */}
          <div 
            className={`${styles.powerButton} ${
              isBooting || isShuttingDown ? styles.booting : 
              isPoweredOn ? styles.poweredOn : 
              styles.poweredOff
            }`}
            onClick={handlePowerToggle}
          >
            <div className={styles.powerIndicator}></div>
          </div>
          
          {/* Knobs */}
          <div className={styles.knobs}>
            <div className={styles.knob}>
              <div className={styles.knobLabel}>TEMP</div>
              <div className={styles.knobControl}>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className={styles.knobRange}
                />
                <div className={styles.knobValue}>{temperature}</div>
              </div>
            </div>
            
            <div className={styles.knob}>
              <div className={styles.knobLabel}>TOP_P</div>
              <div className={styles.knobControl}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className={styles.knobRange}
                />
                <div className={styles.knobValue}>{topP}</div>
              </div>
            </div>
            
            <div className={styles.knob}>
              <div className={styles.knobLabel}>TOKENS</div>
              <div className={styles.knobControl}>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className={styles.knobRange}
                />
                <div className={styles.knobValue}>{maxTokens}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRTTV; 