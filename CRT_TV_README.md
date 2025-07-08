# CRT TV Portfolio Interface

A retro-styled CRT TV interface that serves as the main entry point to Dylan's portfolio. The interface features a chat-based AI assistant that can navigate around the portfolio and provide information about Dylan's background, projects, and experience.

## Features

### 🖥️ CRT TV Aesthetic
- Retro TV frame with realistic styling
- Scan lines effect for authentic CRT look
- Physical-looking knobs for AI parameter control
- Green terminal-style text on black background
- Pulsing power indicator

### 🤖 AI Chat Interface
- RAG-powered chat assistant with knowledge of Dylan's portfolio
- Real-time typing indicators
- Tool call capabilities for navigation
- Configurable AI parameters (temperature, top_p, max tokens)

### 🎛️ Interactive Controls
- **Temperature Knob**: Controls response creativity (0-2)
- **Top_P Knob**: Controls response diversity (0-1)
- **Tokens Knob**: Controls response length (100-2000)
- **Power Button**: Animated indicator showing system status

### 🛠️ Tool Call Capabilities
The AI can perform various actions through tool calls:

- **Navigate to pages**: "Go to about" → Opens about page
- **Show projects**: "Show me the machinterview project" → Opens project page
- **Show music**: "Show me music" → Opens music page
- **Show gallery**: "Show me gallery" → Opens gallery page

## How It Works

### Frontend (CRTTV.tsx)
- React component with TypeScript
- Manages chat state and UI interactions
- Handles tool call execution
- Provides fallback logic if API is unavailable

### Backend (API Route)
- `/api/rag` endpoint for processing chat requests
- Currently uses simulated responses
- Designed to be easily extended with real OpenAI API integration

### Styling (CRTTV.module.scss)
- SCSS modules for component-specific styling
- Responsive design for mobile and desktop
- Authentic CRT TV visual effects

## Extending the System

### Adding Real RAG Functionality

1. **Connect to OpenAI API**:
   ```typescript
   // In /api/rag/route.ts
   import OpenAI from 'openai';
   
   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
   });
   
   // Replace generateRAGResponse with:
   const completion = await openai.chat.completions.create({
     model: "gpt-4",
     messages: [
       {
         role: "system",
         content: `You are an AI assistant that knows everything about Dylan Hubert's portfolio. 
         Use this context: ${portfolioContext}`
       },
       { role: "user", content: message }
     ],
     temperature,
     top_p,
     max_tokens: maxTokens,
   });
   ```

2. **Add Vector Database**:
   - Use Pinecone, Weaviate, or similar for storing portfolio content
   - Embed portfolio content (projects, blog posts, about info)
   - Retrieve relevant context for each query

3. **Enhance Tool Calls**:
   - Add more sophisticated tool call parsing
   - Implement function calling with OpenAI
   - Add more navigation options

### Adding New Tool Calls

1. **Define the tool call type**:
   ```typescript
   interface ToolCall {
     id: string;
     type: 'navigate' | 'open_project' | 'open_blog' | 'show_music' | 'show_gallery' | 'new_tool';
     data: any;
     executed: boolean;
   }
   ```

2. **Add execution logic**:
   ```typescript
   case 'new_tool':
     // Handle new tool call
     break;
   ```

3. **Add UI button**:
   ```typescript
   {toolCall.type === 'new_tool' && 'New Action'}
   ```

### Customizing the Look

The CRT TV styling can be customized by modifying `CRTTV.module.scss`:

- **Colors**: Change the green (#00ff00) to any color
- **Size**: Adjust `.crtFrame` dimensions
- **Effects**: Modify scan lines, shadows, and animations
- **Knobs**: Customize knob appearance and behavior

## Usage Examples

### Chat Commands
- "Tell me about Dylan's NASA work"
- "Show me the machinterview project"
- "What projects has Dylan built?"
- "Go to about page"
- "Show me Dylan's music"
- "What are Dylan's hobbies?"

### Parameter Tuning
- **Low Temperature (0.1)**: More focused, consistent responses
- **High Temperature (1.5)**: More creative, varied responses
- **Low Top_P (0.3)**: More conservative word choices
- **High Top_P (0.9)**: More diverse vocabulary
- **Low Tokens (500)**: Shorter responses
- **High Tokens (1500)**: Longer, more detailed responses

## Future Enhancements

1. **Real-time Voice Input**: Add speech-to-text capabilities
2. **Audio Feedback**: Add retro computer sounds
3. **More AI Models**: Support for different LLMs
4. **Conversation Memory**: Remember chat history
5. **File Upload**: Allow users to ask about uploaded documents
6. **Multi-language Support**: Support for different languages
7. **Analytics**: Track popular questions and interactions

## Technical Notes

- Built with Next.js 14 and TypeScript
- Uses Once UI System for components
- Responsive design for all screen sizes
- Graceful fallback if API is unavailable
- SEO-friendly with proper metadata

## Environment Variables

To enable real OpenAI integration, add to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Deployment

The CRT TV interface is ready for deployment and will work with the current simulated responses. To enable real RAG functionality, simply add the OpenAI API key and the system will automatically use the real API instead of the fallback logic. 