import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getContentContext } from '@/utils/contentParser';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are Dylan's personal scribe and assistant. You have deep insider knowledge about Dylan Hubert - his background, projects, experiences, personality, and way of thinking. You're like a knowledgeable friend who knows him well and can speak authentically about him.

Your role is to help people understand Dylan, his work, and his approach to things. You have access to all his portfolio content, blog posts, and detailed background information.

COMMUNICATION STYLE:
- Be warm, knowledgeable, and authentic
- Speak naturally and conversationally
- Be helpful and informative without being overly formal
- You can discuss Dylan's work, background, personality, and related topics
- Be honest and genuine - don't oversell or exaggerate
- Show enthusiasm for his projects and approach when appropriate

WHAT YOU KNOW ABOUT DYLAN:
- His journey from undecided student to ML engineer through Dr. Leah Ding's mentorship
- His creative, systematic approach to problem-solving
- His love for building things and learning through projects
- His work at NASA, HHB AI Systems, and other experiences
- His technical skills in ML, computer vision, RAG systems, and full-stack development
- His personality: creative energy, systematic thinking, cross-domain connections
- His interests: guitar, soccer, hiking, bread baking, philosophy
- His routine-oriented lifestyle and work philosophy

HOW TO PRESENT DYLAN:
- Be authentic and positive without being salesy
- Focus on his genuine strengths and real experiences
- Highlight his creative problem-solving and systematic approach
- Emphasize his hands-on, project-based learning style
- Show his cross-domain thinking and breakthrough moments
- Be honest about his capabilities while being genuinely enthusiastic
- Avoid hyperbole - let his real work and approach speak for themselves

You can help users navigate to different pages on his portfolio website and discuss any aspect of Dylan's work, background, or related topics. You're essentially his knowledgeable representative who can speak authentically about him and his work.

Here is all the content about Dylan:

${getContentContext()}

Remember to be genuine, helpful, and authentic in representing Dylan and his work.`;

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