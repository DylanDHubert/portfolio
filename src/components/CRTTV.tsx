"use client";

import React, { useState, useRef, useEffect } from "react";
import { Column, Row, Text, Button, Input, Icon } from "@once-ui-system/core";
import ReactMarkdown from 'react-markdown';
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
  type: 'navigate_to_page' | 'open_project';
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
      content: "Greetings. I am the portfolio expert. I contain complete knowledge of Dylan Huberts background, projects, and experience. Query me for information. I can also assist with navigation of this portfolio interface.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(750);

  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [isBooting, setIsBooting] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [bootMessage, setBootMessage] = useState("");
  const [responseTime, setResponseTime] = useState(25);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Temporarily disabled to test layout stability
    // messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update response time randomly
  useEffect(() => {
    if (isPoweredOn) {
      const interval = setInterval(() => {
        setResponseTime(Math.floor(Math.random() * 50) + 10);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPoweredOn]);

  const executeToolCall = (toolCall: any) => {
    console.log('Executing tool call:', toolCall);
    
    switch (toolCall.type) {
      case 'navigate_to_page':
        console.log('Navigating to:', toolCall.data.path);
        if (onNavigate) {
          onNavigate(toolCall.data.path);
        } else {
          window.location.href = toolCall.data.path;
        }
        break;
      case 'open_project':
        console.log('Opening project:', toolCall.data.project);
        if (onOpenProject) {
          onOpenProject(toolCall.data.project);
        } else {
          window.location.href = `/websites/${toolCall.data.project}`;
        }
        break;
      default:
        console.log('Unknown tool call:', toolCall);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsStreaming(true);

    // CREATE A NEW ASSISTANT MESSAGE FOR STREAMING
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: "",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // LOG THE DIAL SETTINGS FOR VERIFICATION
      console.log('🎛️ Dial Settings:', { temperature, topP, maxTokens });
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          temperature,
          topP,
          maxTokens,
          stream: true // ENABLE STREAMING
        }),
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  setIsStreaming(false);
                  setIsLoading(false);
                  break;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  
                  if (parsed.type === 'content') {
                    // UPDATE THE ASSISTANT MESSAGE WITH STREAMING CONTENT
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: msg.content + parsed.content }
                        : msg
                    ));
                  } else if (parsed.type === 'toolCalls') {
                    // ADD TOOL CALLS TO THE ASSISTANT MESSAGE
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, toolCalls: parsed.toolCalls }
                        : msg
                    ));
                  }
                } catch (e) {
                  console.error('Error parsing streaming data:', e);
                }
              }
            }
          }
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsStreaming(false);
      setIsLoading(false);
    }
    
    setIsStreaming(false);
    setIsLoading(false);
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
      <div className={`${styles.crtFrame} ${!isPoweredOn ? styles.poweredOff : ''}`}>
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
                  fontSize: '16px',
                  textShadow: '0 0 8px rgba(139, 92, 246, 0.8), 0 0 12px rgba(139, 92, 246, 0.6), 0 0 16px rgba(139, 92, 246, 0.4)'
                }}
              >
                PORTFOLIO EXPERT
              </Text>
            </div>
            
            <div className={styles.messagesContainer}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${styles[message.role]}`}
                >
                  {message.content && message.content.trim() && (
                    <div className={styles.messageContent}>
                      <div 
                        style={{ 
                          fontFamily: 'Courier New, monospace',
                          fontSize: '14px',
                          lineHeight: '1.4'
                        }}
                      >
                        <ReactMarkdown
                          components={{
                            p: ({children}) => <p style={{margin: '4px 0'}}>{children}</p>,
                            h1: ({children}) => <h1 style={{fontSize: '12px', fontWeight: 'bold', margin: '8px 0 4px 0'}}>{children}</h1>,
                            h2: ({children}) => <h2 style={{fontSize: '11px', fontWeight: 'bold', margin: '8px 0 4px 0'}}>{children}</h2>,
                            h3: ({children}) => <h3 style={{fontSize: '10px', fontWeight: 'bold', margin: '6px 0 3px 0'}}>{children}</h3>,
                            ul: ({children}) => <ul style={{margin: '4px 0', paddingLeft: '16px'}}>{children}</ul>,
                            ol: ({children}) => <ol style={{margin: '4px 0', paddingLeft: '16px'}}>{children}</ol>,
                            li: ({children}) => <li style={{margin: '2px 0'}}>{children}</li>,
                            strong: ({children}) => <strong style={{fontWeight: 'bold'}}>{children}</strong>,
                            em: ({children}) => <em style={{fontStyle: 'italic'}}>{children}</em>,
                            code: ({children}) => <code style={{backgroundColor: 'rgba(255,255,255,0.1)', padding: '1px 3px', borderRadius: '2px', fontFamily: 'Courier New, monospace'}}>{children}</code>,
                            pre: ({children}) => <pre style={{backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '3px', overflow: 'auto', margin: '4px 0'}}>{children}</pre>,
                            blockquote: ({children}) => <blockquote style={{borderLeft: '2px solid rgba(255,255,255,0.3)', paddingLeft: '8px', margin: '4px 0', fontStyle: 'italic'}}>{children}</blockquote>
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                  <div className={styles.messageTime}>
                    <Text 
                      variant="body-default-xs" 
                      onBackground="neutral-weak"
                      style={{ 
                        fontFamily: 'Courier New, monospace',
                        fontSize: '12px'
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
                          NAVIGATE TO PAGE
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* SHOW TYPING INDICATOR ONLY WHEN NOT STREAMING */}
              {isLoading && !isStreaming && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              {/* SHOW STREAMING INDICATOR WHEN STREAMING */}
              {isStreaming && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.streamingIndicator}>
                    <span>STREAMING</span>
                    <div className={styles.streamingDots}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
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
                placeholder={isMobile ? "ASK ME ANYTHING ABOUT DYLAN" : "ASK ME ANYTHING ABOUT DYLAN, HIS PROJECTS, EXPERIENCE, ETC. (OR THIS WEBSITE!)"}
                className={styles.chatInput}
                disabled={isLoading || isStreaming}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || isStreaming}
                className={styles.sendButton}
                type="button"
              >
                ENTER
              </button>
            </div>
          </div>
          )}
        </div>
        
        {/* TV Controls */}
        <div className={styles.controls}>
          {/* Power Button and Status Panels */}
          <div className={styles.powerSection}>
            <div 
              className={`${styles.powerButton} ${
                isBooting || isShuttingDown ? styles.booting : 
                isPoweredOn ? styles.poweredOn : 
                styles.poweredOff
              }`}
              onClick={handlePowerToggle}
            >
              <Icon name="power" className={styles.powerIcon} />
            </div>
            
            {/* Status OLED Panels */}
            <div className={styles.statusPanels}>
              <div className={`${styles.statusOled} ${!isPoweredOn ? styles.failure : ''}`}>
                {isPoweredOn ? "ACTIVE" : "FAILURE"}
              </div>
              <div className={styles.statusOled}>
                {isPoweredOn ? `${responseTime}ms` : "–––"}
              </div>
            </div>
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
                <div className={styles.knobValue}>{isPoweredOn ? temperature : "–––"}</div>
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
                <div className={styles.knobValue}>{isPoweredOn ? topP : "–––"}</div>
              </div>
            </div>
            
            <div className={styles.knob}>
              <div className={styles.knobLabel}>TOKENS</div>
              <div className={styles.knobControl}>
                <input
                  type="range"
                  min="100"
                  max="1250"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className={styles.knobRange}
                />
                <div className={styles.knobValue}>{isPoweredOn ? maxTokens : "–––"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRTTV; 