// Data Models for the Study Companion Application

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[]; // 4 options
  correctAnswerIndex: number; // Index of the correct option in the options array (0-3)
}

export interface Flashcard {
  id: number;
  front: string; // The term or question
  back: string;  // The definition or answer
}

export interface StudyMaterial {
  summary: string;
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiContent {
  role?: 'user' | 'model';
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
}

export interface GeminiRequest {
  contents: GeminiContent[];
  systemInstruction?: {
    parts: { text: string }[];
  };
  generationConfig?: {
    responseMimeType?: string;
    responseSchema?: any;
  };
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export interface UploadedDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  pdfBase64: string;
  studyMaterial?: StudyMaterial;
}
