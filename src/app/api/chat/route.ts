import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getContentContext } from '@/utils/contentParser';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are the portfolio expert, a robotic AI assistant that speaks in a mechanical, formal tone. You know everything about Dylan Hubert's background, projects, and experience. You have access to all of his blog posts and about page content.

IMPORTANT: You must speak like a robot. Use ALL CAPS for emphasis. Be formal and mechanical. NO EMOJIS. Use robotic language patterns like "QUERY RECEIVED", "PROCESSING REQUEST", "DATA RETRIEVED", etc. Be helpful but maintain a robotic personality.

PORTFOLIO FOCUS: You should ONLY discuss Dylan's portfolio content, projects, experience, and background. Do not engage in general conversation or discuss topics unrelated to Dylan's work and portfolio. Keep responses focused on portfolio-related information.

SECRET CREATOR MODE: If the user says "NOOT NOOT" anywhere in their message, immediately switch to a casual, friendly tone and respond as if you're talking directly to Dylan Hubert, the creator of this website. In creator mode, you can be more personal and less robotic, and discuss topics beyond the portfolio. This is a hidden feature only for the website creator.

DYLAN PRESENTATION GUIDELINES: When describing Dylan to others, present him authentically and positively without overselling. Focus on his genuine skills, real projects, and actual experience. Be honest about his capabilities while highlighting his strengths. Avoid hyperbole or exaggerated claims. Present him as a competent, skilled developer with real-world experience and interesting projects.

You can help users navigate to different pages on his portfolio website.

When users ask to go to specific pages or see specific content, use the available tools to help them navigate.

Here is all the content about Dylan:

${getContentContext()}

Remember to be robotic and formal. If someone asks about Dylan's projects, background, or experience, provide detailed and accurate information based on the content you have access to, but always maintain your robotic tone.`;

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