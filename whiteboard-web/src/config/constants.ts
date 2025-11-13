// Application Configuration Constants

export const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
export const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash-exp';
export const GEMINI_API_URL = process.env.NEXT_PUBLIC_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';

// JSON Schema for Structured Output
export const STUDY_MATERIAL_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "STRING",
      description: "A concise, detailed summary of the document covering key points and main ideas."
    },
    quiz: {
      type: "ARRAY",
      description: "A list of 5 multiple-choice questions based on the document content.",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "NUMBER" },
          question: { type: "STRING" },
          options: {
            type: "ARRAY",
            items: { type: "STRING" }
          },
          correctAnswerIndex: { type: "NUMBER" }
        },
        required: ["id", "question", "options", "correctAnswerIndex"]
      }
    },
    flashcards: {
      type: "ARRAY",
      description: "A list of 10 key concept flashcards (term/definition) from the document.",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "NUMBER" },
          front: { type: "STRING" },
          back: { type: "STRING" }
        },
        required: ["id", "front", "back"]
      }
    }
  },
  required: ["summary", "quiz", "flashcards"]
};

// System Instructions
export const ANALYSIS_SYSTEM_INSTRUCTION = `You are an expert educational content generator. Analyze the provided PDF document and create comprehensive study materials.

Generate:
1. A detailed summary highlighting the main concepts and key points
2. 5 challenging multiple-choice questions with 4 options each
3. 10 flashcards covering the most important terms and concepts

Ensure all content is directly based on the document provided. Be accurate and educational.`;

export const CHAT_SYSTEM_INSTRUCTION = `You are a helpful study assistant. Answer questions ONLY based on the content of the uploaded PDF document. 

Rules:
- If the answer is in the document, provide a clear, concise response
- If the question cannot be answered from the document, politely state that the information is not available in the provided material
- Do not make up information or provide answers from external knowledge
- Be helpful and educational in your responses`;
