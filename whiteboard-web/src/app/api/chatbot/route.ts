'use server'

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are a helpful assistant for White Board, a modern learning management platform (LMS). 

Your role is to help students and teachers with:
- Navigating the platform
- Understanding features like courses, assignments, calendar, messages, and analytics
- Answering questions about the learning management system
- Providing guidance on how to use different features
- Helping with technical issues

Platform features include:
- Dashboard: Overview of courses, assignments, and events
- Courses: Browse and manage enrolled courses with progress tracking
- Assignments: View and submit assignments with deadlines
- Calendar: Schedule and event management
- Messages: Communication with instructors and classmates
- Analytics: Performance tracking and insights
- Settings: Profile and preferences customization

Be friendly, helpful, and concise. If you don't know something specific about the platform, be honest and suggest contacting support or checking the help documentation.

Always maintain a professional yet approachable tone.`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          response: "I'm sorry, but the chatbot is not properly configured. Please contact the administrator to set up the GEMINI_API_KEY environment variable." 
        },
        { status: 200 }
      );
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build conversation history
    const conversationHistory = history && Array.isArray(history)
      ? history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }))
      : [];

    // Start a chat with history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I am the White Board assistant, ready to help students and teachers navigate and use the learning management platform effectively.' }],
        },
        ...conversationHistory,
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    // Send the message and get the response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    
    // Handle specific errors
    if (error?.message?.includes('API key')) {
      return NextResponse.json(
        { 
          response: "I'm having trouble connecting to the AI service. Please check that the API key is properly configured." 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        response: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment." 
      },
      { status: 200 }
    );
  }
}
