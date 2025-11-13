/**
 * API Response Type
 * Standard response format for all API calls
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

/**
 * User Types
 */
export enum Role {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Course Types
 */
export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  schedule?: string | null;
  location?: string | null;
  maxEnrollment: number;
  enrollmentCount?: number;
  startDate: string;
  endDate: string;
  isEnrolled?: boolean;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  grade?: number | null;
  enrolledAt: string;
  course?: Course;
}

/**
 * Assignment Types
 */
export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  maxPoints: number;
  attachments?: Record<string, unknown>;
  courseId: string;
  course?: {
    id: string;
    code: string;
    title: string;
  };
  submissions?: Submission[];
  createdAt: string;
}

export interface Submission {
  id: string;
  submittedAt: string;
  grade?: number | null;
  status?: string;
  content?: string;
  attachments?: Record<string, unknown>;
}

/**
 * Course Module & Resource Types
 */
export enum ResourceType {
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  READING = 'READING',
  LINK = 'LINK',
  QUIZ = 'QUIZ',
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleResource {
  id: string;
  moduleId: string;
  title: string;
  description?: string | null;
  type: ResourceType;
  url?: string | null; // URL for videos, links, or file paths
  content?: string | null; // For text content/reading materials
  duration?: number | null; // For videos, in minutes
  order: number;
  isRequired?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceProgress {
  id: string;
  resourceId: string;
  userId: string;
  isCompleted: boolean;
  progress: number; // 0-100
  viewedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleProgress {
  id: string;
  moduleId: string;
  userId: string;
  isCompleted: boolean;
  progress: number; // 0-100
  startedAt: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// DTOs for API requests
export interface CreateModuleDto {
  title: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

export interface UpdateModuleDto {
  title?: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

export interface CreateResourceDto {
  title: string;
  description?: string;
  type: ResourceType;
  url?: string;
  content?: string;
  duration?: number;
  order?: number;
  isRequired?: boolean;
}

export interface UpdateResourceDto {
  title?: string;
  description?: string;
  content?: string;
  duration?: number;
  order?: number;
  isPublished?: boolean;
}

export interface ResourceProgressDto {
  isCompleted?: boolean;
  progress?: number;
  viewedAt?: string;
}

export interface ModuleProgressDto {
  isCompleted?: boolean;
  progress?: number;
  completedAt?: string;
}

// Response types
export interface CourseModuleResponse extends CourseModule {
  resources?: ModuleResource[];
  progress?: ModuleProgress | null;
  resourceProgress?: ResourceProgress[];
}

export interface ModuleResourceResponse extends ModuleResource {
  progress?: ResourceProgress | null;
}

export interface CourseStatisticsResponse {
  courseId: string;
  totalModules: number;
  completedModules: number;
  averageProgress: number;
  studentProgress: Array<{
    userId: string;
    userName: string;
    overallProgress: number;
    completedModules: number;
  }>;
}

/**
 * Quiz Types
 */
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
}

export enum QuizType {
  PRACTICE = 'PRACTICE',
  GRADED = 'GRADED',
  SURVEY = 'SURVEY',
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: QuestionType;
  options?: QuizOption[];
  correctAnswer?: string;
  points: number;
  order: number;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  moduleId?: string;
  courseId: string;
  title: string;
  description?: string;
  type: QuizType;
  timeLimit?: number;
  passingScore: number;
  maxAttempts?: number;
  isPublished: boolean;
  availableFrom?: string;
  availableUntil?: string;
  showAnswers: boolean;
  shuffleQuestions: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
}

export interface CreateQuizDto {
  moduleId?: string;
  courseId: string;
  title: string;
  description?: string;
  type?: QuizType;
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  isPublished?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  showAnswers?: boolean;
  shuffleQuestions?: boolean;
}

export interface CreateQuizQuestionDto {
  quizId: string;
  question: string;
  type: QuestionType;
  options?: QuizOption[];
  correctAnswer?: string;
  points?: number;
  explanation?: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  userId: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  isPassed: boolean;
  timeSpent?: number;
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  pointsEarned: number;
  feedback?: string;
  createdAt: string;
}

export interface SubmitQuizAnswerDto {
  submissionId: string;
  questionId: string;
  answer: string;
}

/**
 * Settings Types
 */
export interface UserSettings {
  id: string;
  userId: string;
  theme: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  assignmentNotifications: boolean;
  messageNotifications: boolean;
  announcementNotifications: boolean;
  profileVisibility: string;
  showEmail: boolean;
}

/**
 * Pagination Types
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
