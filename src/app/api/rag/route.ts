import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, temperature, topP, maxTokens } = await request.json();

    // For now, simulate RAG responses
    // In the future, this could connect to OpenAI API with your portfolio content as context
    const response = generateRAGResponse(message.toLowerCase());

    return NextResponse.json({
      content: response.content,
      toolCalls: response.toolCalls || [],
      usage: {
        promptTokens: message.length,
        completionTokens: response.content.length,
        totalTokens: message.length + response.content.length
      }
    });
  } catch (error) {
    console.error('RAG API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

function generateRAGResponse(userInput: string): { content: string; toolCalls?: any[] } {
  // This is the same logic as in the frontend, but could be replaced with actual OpenAI API calls
  if (userInput.includes('show me') && userInput.includes('project')) {
    if (userInput.includes('machinterview')) {
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
    if (userInput.includes('eudaemonia')) {
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

  if (userInput.includes('show me') && userInput.includes('music')) {
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

  if (userInput.includes('show me') && userInput.includes('gallery')) {
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

  if (userInput.includes('go to') && userInput.includes('about')) {
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
} 