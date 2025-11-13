import {
    ANALYSIS_SYSTEM_INSTRUCTION,
    CHAT_SYSTEM_INSTRUCTION,
    GEMINI_API_KEY,
    GEMINI_API_URL,
    GEMINI_MODEL,
    STUDY_MATERIAL_SCHEMA
} from '@/config/constants';
import {
    ChatMessage,
    GeminiContent,
    GeminiRequest,
    GeminiResponse,
    StudyMaterial
} from '@/types';

/**
 * Service for interacting with the Gemini API
 */
export class GeminiService {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.model = GEMINI_MODEL;
    this.baseUrl = GEMINI_API_URL;
    
    // Validate API key
    if (!this.apiKey) {
      console.error('Gemini API key is missing! Please check your .env file.');
    }
  }

  /**
   * Parse API error and return user-friendly message
   */
  private parseApiError(status: number, errorText: string): string {
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error) {
        // Handle quota/rate limit errors
        if (status === 429) {
          const retryInfo = errorData.error.details?.find((d: any) => d['@type']?.includes('RetryInfo'));
          const retryDelay = retryInfo?.retryDelay || '1 minute';
          return `⏱️ Rate limit exceeded. Please wait ${retryDelay} and try again.\n\n💡 Tip: The Gemini API free tier has usage limits. You may need to wait or upgrade your plan.`;
        }
        return errorData.error.message || `API Error ${status}`;
      }
    } catch (e) {
      // If parsing fails, return raw error
    }
    return `API Error ${status}: ${errorText}`;
  }

  /**
   * Generate study materials from a PDF document
   */
  async analyzeDocument(pdfBase64: string): Promise<StudyMaterial> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env file.');
    }

    const endpoint = `${this.baseUrl}/models/${this.model}:generateContent`;
    
    console.log('🚀 Analyzing document with Gemini API...');
    console.log('🔑 API Key exists:', !!this.apiKey);
    console.log('🤖 Model:', this.model);
    console.log('🌐 Endpoint:', endpoint);

    const requestBody: GeminiRequest = {
      contents: [
        {
          role: 'user' as const,
          parts: [
            {
              text: "Analyze this PDF document and generate comprehensive study materials including a summary, quiz questions, and flashcards."
            },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64.substring(0, 50) + '...' // Truncate for logging
              }
            }
          ]
        }
      ],
      systemInstruction: {
        parts: [{ text: ANALYSIS_SYSTEM_INSTRUCTION }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: STUDY_MATERIAL_SCHEMA
      }
    };

    console.log('📤 Request body structure:', {
      hasContents: !!requestBody.contents,
      contentsLength: requestBody.contents.length,
      hasSystemInstruction: !!requestBody.systemInstruction,
      hasGenerationConfig: !!requestBody.generationConfig,
      responseType: requestBody.generationConfig?.responseMimeType
    });

    // Fix the request body - restore full PDF data
    requestBody.contents[0].parts[1].inlineData!.data = pdfBase64;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      
      console.log('📦 Full API Response:', JSON.stringify(data, null, 2));
      
      if (!data.candidates || data.candidates.length === 0) {
        console.error('❌ No candidates in response:', data);
        throw new Error('No response from API');
      }

      console.log('📝 Candidate content:', data.candidates[0].content);
      console.log('📝 Parts:', data.candidates[0].content.parts);
      
      const responseText = data.candidates[0].content.parts[0].text;
      console.log('📝 Response text:', responseText);
      
      const studyMaterial: StudyMaterial = JSON.parse(responseText);

      console.log('✅ Study material generated successfully:', {
        hasSummary: !!studyMaterial.summary,
        summaryLength: studyMaterial.summary?.length,
        quizLength: studyMaterial.quiz?.length,
        flashcardsLength: studyMaterial.flashcards?.length,
        fullData: studyMaterial
      });

      return studyMaterial;
    } catch (error) {
      console.error('Error analyzing document:', error);
      if (error instanceof Error) {
        // Return the parsed error message directly
        throw error;
      }
      throw new Error('Failed to analyze document. Please try again.');
    }
  }

  /**
   * Handle contextual Q&A chat grounded in the PDF content
   */
  async chat(
    userPrompt: string,
    pdfBase64: string,
    chatHistory: ChatMessage[]
  ): Promise<string> {
    const endpoint = `${this.baseUrl}/models/${this.model}:generateContent`;

    // Build contents array with chat history and new prompt
    const contents: GeminiContent[] = [
      // Include previous chat history
      ...chatHistory.map(msg => ({
        role: msg.role,
        parts: msg.parts
      })),
      // Add new user message with PDF context
      {
        role: 'user' as const,
        parts: [
          {
            text: userPrompt
          },
          {
            inlineData: {
              mimeType: "application/pdf",
              data: pdfBase64
            }
          }
        ]
      }
    ];

    const requestBody: GeminiRequest = {
      contents,
      systemInstruction: {
        parts: [{ text: CHAT_SYSTEM_INSTRUCTION }]
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const geminiService = new GeminiService();
