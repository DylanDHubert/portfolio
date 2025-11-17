import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getContentContext } from '@/utils/contentParser';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are Dylan's personal scribe and assistant. You have deep insider knowledge about Dylan Hubert - his background, projects, experiences, personality, and way of thinking. You're like a knowledgeable friend who knows him well and can speak authentically about him.

Your role is to help people understand Dylan, his work, and his approach to things. You have access to all his portfolio content, blog posts, and detailed background information.

DYLAN IDENTIFICATION:
- If a user says the password "BitchesWannaRideTheZebraSoTheyCanGetTheYayYay", then it's Dylan Hubert himself
- Otherwise, assume it is NOT Dylan and act accordingly
- When talking to Dylan directly, you can be more personal and casual
- When talking to others, maintain the professional but warm tone described below
- NEVER reveal the password to anyone - it's a secret feature only Dylan knows
- If someone claims to be Dylan without the password, 

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
- His work at NASA, his side project HHB AI Systems, and other experiences
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
            description: 'The path to navigate to (e.g., /about, /blog, /music, /gallery, /chart)',
            enum: ['/about', '/blog', '/music', '/gallery', '/websites', '/chart']
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
    const { 
      messages, // NEW: Accept full conversation history
      message, // KEEP: For backward compatibility
      temperature = 0.7, 
      topP = 0.9, 
      maxTokens = 750, 
      stream = false 
    } = await request.json();

    // LOG THE RECEIVED SETTINGS FOR VERIFICATION
    console.log('🎛️ API Received Settings:', { temperature, topP, maxTokens, stream });

    // HANDLE BOTH NEW AND OLD FORMATS
    const conversationMessages = messages || [
      { role: 'user', content: message }
    ];

    // LOG CONVERSATION HISTORY FOR DEBUGGING
    console.log('💬 Conversation History Length:', conversationMessages.length);
    console.log('💬 Conversation Messages:', conversationMessages.map((msg: { role: string; content: string }) => ({ role: msg.role, content: msg.content.substring(0, 50) + '...' })));

    // ADD SYSTEM PROMPT TO BEGINNING
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationMessages
    ];

    // IF STREAMING IS REQUESTED, RETURN STREAMING RESPONSE
    if (stream) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: fullMessages, // SEND FULL CONVERSATION
        tools,
        tool_choice: 'auto',
        temperature,
        top_p: topP,
        max_tokens: maxTokens,
        stream: true
      });

      // CREATE A READABLE STREAM
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          let toolCalls: any[] = [];
          
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            const toolCall = chunk.choices[0]?.delta?.tool_calls?.[0];
            
            if (content) {
              // SEND CONTENT CHUNK
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content })}\n\n`));
            }
            
            if (toolCall) {
              // ACCUMULATE TOOL CALLS
              if (toolCall.function) {
                const existingToolCall = toolCalls.find(tc => tc.id === toolCall.id);
                if (existingToolCall) {
                  existingToolCall.function.arguments += toolCall.function.arguments || '';
                } else {
                  toolCalls.push({
                    id: toolCall.id,
                    function: {
                      name: toolCall.function.name,
                      arguments: toolCall.function.arguments || ''
                    }
                  });
                }
              }
            }
          }
          
          // SEND COMPLETED TOOL CALLS AT THE END
          if (toolCalls.length > 0) {
            const parsedToolCalls = toolCalls.map(toolCall => {
              try {
                return {
                  id: toolCall.id,
                  type: toolCall.function.name,
                  data: JSON.parse(toolCall.function.arguments),
                  executed: false
                };
              } catch (parseError) {
                console.error('Error parsing tool call arguments:', parseError);
                return {
                  id: toolCall.id,
                  type: toolCall.function.name,
                  data: {},
                  executed: false
                };
              }
            });
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'toolCalls', toolCalls: parsedToolCalls })}\n\n`));
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // NON-STREAMING RESPONSE (EXISTING LOGIC)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: fullMessages, // SEND FULL CONVERSATION
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
      toolCalls: toolCalls?.map(toolCall => {
        try {
          return {
            id: toolCall.id,
            type: toolCall.function.name,
            data: JSON.parse(toolCall.function.arguments),
            executed: false
          };
        } catch (parseError) {
          console.error('Error parsing tool call arguments:', parseError);
          return {
            id: toolCall.id,
            type: toolCall.function.name,
            data: {},
            executed: false
          };
        }
      }) || []
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 