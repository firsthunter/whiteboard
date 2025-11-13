import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.SERVER_URL || 'http://localhost:4050/api';

export interface StudyDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  pageCount?: number;
  uploadedAt: string;
  processedAt?: string;
  errorMessage?: string;
}

export interface Summary {
  id: string;
  content: string;
  keyPoints: string[];
  generatedAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  generatedAt: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardSet {
  id: string;
  cards: Flashcard[];
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedExam {
  id: string;
  title: string;
  description?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
  questionCount: number;
  questions: any[];
  timeLimit?: number;
  totalPoints: number;
  generatedAt: string;
}

class AIStudyAPI {
  private async getAuthHeader() {
    // Get token from NextAuth session
    const session = await getSession();
    const token = (session as any)?.accessToken;
    
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // Upload PDF document
  async uploadDocument(file: File, title: string, courseId?: string): Promise<StudyDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (courseId) {
      formData.append('courseId', courseId);
    }

    const response = await axios.post(
      `${API_URL}/ai-study/upload`,
      formData,
      await this.getAuthHeader()
    );
    return response.data;
  }

  // Get all documents
  async getDocuments(): Promise<StudyDocument[]> {
    const response = await axios.get(
      `${API_URL}/ai-study/documents`,
      await this.getAuthHeader()
    );
    return response.data;
  }

  // Generate summary
  async generateSummary(documentId: string): Promise<Summary> {
    const response = await axios.post(
      `${API_URL}/ai-study/summary/${documentId}`,
      {},
      await this.getAuthHeader()
    );
    return response.data;
  }

  // Generate quiz
  async generateQuiz(documentId: string): Promise<Quiz> {
    const response = await axios.post(
      `${API_URL}/ai-study/quiz/${documentId}`,
      {},
      await this.getAuthHeader()
    );
    return response.data;
  }

  // Submit quiz attempt
  async submitQuiz(quizId: string, answers: number[]): Promise<any> {
    const response = await axios.post(
      `${API_URL}/ai-study/quiz/submit`,
      { quizId, answers },
      await this.getAuthHeader()
    );
    return response.data;
  }

  // Generate flashcards
  async generateFlashcards(documentId: string): Promise<FlashcardSet> {
    const response = await axios.post(
      `${API_URL}/ai-study/flashcards/${documentId}`,
      {},
      await this.getAuthHeader()
    );
    return response.data;
  }

  // Send chat message
  async sendChatMessage(
    documentId: string,
    message: string,
    sessionId?: string
  ): Promise<{ sessionId: string; message: string }> {
    const response = await axios.post(
      `${API_URL}/ai-study/chat`,
      { documentId, message, sessionId },
      await this.getAuthHeader()
    );
    return response.data;
  }

  // Get chat sessions
  async getChatSessions(documentId: string): Promise<ChatSession[]> {
    const response = await axios.get(
      `${API_URL}/ai-study/chat/${documentId}`,
      await this.getAuthHeader()
    );
    return response.data;
  }

  // Generate exam (Teacher only)
  async generateExam(data: {
    documentId: string;
    courseId?: string;
    title: string;
    description?: string;
    questionCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    timeLimit?: number;
  }): Promise<GeneratedExam> {
    const response = await axios.post(
      `${API_URL}/ai-study/exam/generate`,
      data,
      await this.getAuthHeader()
    );
    return response.data;
  }

  // Get generated exams (Teacher only)
  async getGeneratedExams(): Promise<GeneratedExam[]> {
    const response = await axios.get(
      `${API_URL}/ai-study/exams`,
      await this.getAuthHeader()
    );
    return response.data;
  }
}

export const aiStudyAPI = new AIStudyAPI();
