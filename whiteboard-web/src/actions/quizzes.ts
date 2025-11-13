'use server';

import { handleRequest } from './utils/handleRequest';
import type {
  Quiz,
  QuizQuestion,
  QuizSubmission,
  CreateQuizDto,
  CreateQuizQuestionDto,
  SubmitQuizAnswerDto,
  QuizAnswer,
} from './utils/types';

/**
 * Quiz Management Actions
 */

// Create a quiz
export async function createQuiz(
  data: CreateQuizDto
) {
  return handleRequest<Quiz>('post', 'quizzes', data);
}

// Get quiz by ID
export async function getQuizById(quizId: string) {
  return handleRequest<Quiz>('get', `quizzes/${quizId}`);
}

// Update quiz
export async function updateQuiz(
  quizId: string,
  data: Partial<CreateQuizDto>
) {
  return handleRequest<Quiz>('patch', `quizzes/${quizId}`, data);
}

// Delete quiz
export async function deleteQuiz(quizId: string) {
  return handleRequest<{ message: string }>('delete', `quizzes/${quizId}`);
}

// Get quizzes for a module
export async function getModuleQuizzes(moduleId: string) {
  return handleRequest<Quiz[]>('get', `modules/${moduleId}/quizzes`);
}

// Get quizzes for a course
export async function getCourseQuizzes(courseId: string) {
  return handleRequest<Quiz[]>('get', `courses/${courseId}/quizzes`);
}

/**
 * Quiz Question Actions
 */

// Create a question
export async function createQuizQuestion(data: CreateQuizQuestionDto) {
  return handleRequest<QuizQuestion>('post', 'quiz-questions', data);
}

// Update question
export async function updateQuizQuestion(
  questionId: string,
  data: Partial<CreateQuizQuestionDto>
) {
  return handleRequest<QuizQuestion>('patch', `quiz-questions/${questionId}`, data);
}

// Delete question
export async function deleteQuizQuestion(questionId: string) {
  return handleRequest<{ message: string }>('delete', `quiz-questions/${questionId}`);
}

// Get questions for a quiz
export async function getQuizQuestions(quizId: string) {
  return handleRequest<QuizQuestion[]>('get', `quizzes/${quizId}/questions`);
}

/**
 * Quiz Submission Actions (Student)
 */

// Start a quiz attempt
export async function startQuizAttempt(quizId: string) {
  return handleRequest<QuizSubmission>('post', `quizzes/${quizId}/start`);
}

// Submit an answer
export async function submitQuizAnswer(data: SubmitQuizAnswerDto) {
  return handleRequest<QuizAnswer>('post', 'quiz-answers', data);
}

// Submit quiz (finalize)
export async function submitQuiz(submissionId: string) {
  return handleRequest<QuizSubmission>('post', `quiz-submissions/${submissionId}/submit`);
}

// Get quiz submission
export async function getQuizSubmission(submissionId: string) {
  return handleRequest<QuizSubmission>('get', `quiz-submissions/${submissionId}`);
}

// Get my quiz attempts
export async function getMyQuizAttempts(quizId: string) {
  return handleRequest<QuizSubmission[]>('get', `quizzes/${quizId}/my-attempts`);
}

// Get quiz statistics (for instructor)
export async function getQuizStatistics(quizId: string) {
  return handleRequest<{
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    submissionsByStudent: Array<{
      userId: string;
      userName: string;
      attempts: number;
      bestScore: number;
      passed: boolean;
    }>;
  }>('get', `quizzes/${quizId}/statistics`);
}
