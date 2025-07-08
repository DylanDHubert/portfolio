import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getContentContext } from '@/utils/contentParser';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are an AI assistant that knows everything about Dylan Hubert's background, projects, and experience. You have access to all of his blog posts and about page content.

You should be helpful, friendly, and knowledgeable about Dylan's work. You can help users navigate to different pages on his portfolio website.

When users ask to go to specific pages or see specific content, use the available tools to help them navigate.

Here is all the content about Dylan:

${getContentContext()}

Remember to be conversational and helpful. If someone asks about Dylan's projects, background, or experience, provide detailed and accurate information based on the content you have access to.`;

const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'navigate_to_page',
      description: 'Navigate to a specific page on the portfolio website',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The path to navigate to (e.g., /about, /blog, /music, /gallery)',
            enum: ['/about', '/blog', '/music', '/gallery', '/websites']
          }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'open_project',
      description: 'Open a specific project page',
      parameters: {
        type: 'object',
        properties: {
          project: {
            type: 'string',
            description: 'The project to open',
            enum: ['machinterview', 'eudaemonia-wellness']
          }
        },
        required: ['project']
      }
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const { message, temperature = 0.7, topP = 0.9, maxTokens = 1000 } = await request.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      tools,
      tool_choice: 'auto',
      temperature,
      top_p: topP,
      max_tokens: maxTokens
    });

    const response = completion.choices[0];
    const messageContent = response.message.content;
    const toolCalls = response.message.tool_calls;

    return NextResponse.json({
      content: messageContent,
      toolCalls: toolCalls?.map(toolCall => ({
        id: toolCall.id,
        type: toolCall.function.name,
        data: JSON.parse(toolCall.function.arguments),
        executed: false
      })) || []
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 