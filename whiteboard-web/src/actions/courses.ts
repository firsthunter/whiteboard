'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { handleRequest, buildQueryString } from './utils/handleRequest';
import { ApiResponse, Course, Enrollment, PaginatedResponse } from './utils/types';

// Validation Schemas
const CreateCourseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  instructorId: z.string().uuid('Invalid instructor ID'),
  schedule: z.string().optional(),
  location: z.string().optional(),
  maxEnrollment: z.number().int().positive().optional(),
  startDate: z.string(), // ISO date string
  endDate: z.string(), // ISO date string
});

const UpdateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  schedule: z.string().optional(),
  location: z.string().optional(),
  maxEnrollment: z.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const QueryCoursesSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  instructorId: z.string().uuid().optional(),
});

// Types
type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;
type QueryCoursesInput = z.infer<typeof QueryCoursesSchema>;

/**
 * Get all courses with optional filters
 */
export async function getCourses(
  params: QueryCoursesInput = {},
): Promise<ApiResponse<any>> {
  const validation = QueryCoursesSchema.safeParse(params);

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.error.issues[0].message,
      },
    };
  }

  const queryString = await buildQueryString(validation.data);

  return handleRequest<PaginatedResponse<Course>>('get', `courses${queryString}`);
}

/**
 * Get course by ID
 */
export async function getCourseById(
  courseId: string,
): Promise<ApiResponse<Course>> {
  if (!courseId) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Course ID is required',
      },
    };
  }

  return handleRequest<Course>('get', `courses/${courseId}`);
}

/**
 * Create new course (Instructor/Admin only)
 */
export async function createCourse(
  input: CreateCourseInput,
): Promise<ApiResponse<Course>> {
  const validation = CreateCourseSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.error.issues[0].message,
      },
    };
  }

  const result = await handleRequest<Course>('post', 'courses', validation.data);
  
  // Revalidate courses pages after successful creation
  if (result.success) {
    revalidatePath('/courses');
    revalidatePath('/courses/manage');
  }
  
  return result;
}

/**
 * Update course
 */
export async function updateCourse(
  courseId: string,
  input: UpdateCourseInput,
): Promise<ApiResponse<Course>> {
  const validation = UpdateCourseSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.error.issues[0].message,
      },
    };
  }

  const result = await handleRequest<Course>('patch', `courses/${courseId}`, validation.data);
  
  // Revalidate courses pages after successful update
  if (result.success) {
    revalidatePath('/courses');
    revalidatePath('/courses/manage');
    revalidatePath(`/courses/${courseId}`);
  }
  
  return result;
}

/**
 * Delete course
 */
export async function deleteCourse(
  courseId: string,
): Promise<ApiResponse<void>> {
  const result = await handleRequest<void>('delete', `courses/${courseId}`);
  
  // Revalidate courses pages after successful deletion
  if (result.success) {
    revalidatePath('/courses');
    revalidatePath('/courses/manage');
  }
  
  return result;
}

/**
 * Enroll in a course
 */
export async function enrollInCourse(
  courseId: string,
): Promise<ApiResponse<Enrollment>> {
  return handleRequest<Enrollment>('post', `courses/${courseId}/enroll`);
}

/**
 * Unenroll from a course
 */
export async function unenrollFromCourse(
  courseId: string,
): Promise<ApiResponse<void>> {
  return handleRequest<void>('delete', `courses/${courseId}/enroll`);
}

/**
 * Get my enrolled courses
 */
export async function getMyEnrollments(): Promise<ApiResponse<Enrollment[]>> {
  return handleRequest<Enrollment[]>('get', 'courses/my-enrollments');
}

/**
 * Get student progress in a course
 */
export async function getStudentProgress(courseId: string) {
  if (!courseId) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Course ID is required',
      },
    };
  }

  return handleRequest('get', `courses/${courseId}/progress`);
}

/**
 * Get course statistics (Instructor only)
 */
export async function getCourseStatistics(courseId: string): Promise<ApiResponse<{
  assignmentsCount: number;
  modulesCount: number;
  resourcesCount: number;
  enrolledStudentsCount: number;
}>> {
  if (!courseId) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Course ID is required',
      },
    };
  }

  return handleRequest('get', `courses/${courseId}/statistics`);
}

/**
 * Check certificate eligibility
 */
export async function checkCertificateEligibility(courseId: string) {
  if (!courseId) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Course ID is required',
      },
    };
  }

  return handleRequest('get', `courses/${courseId}/certificate-eligibility`);
}

/**
 * Recalculate enrollment progress
 */
export async function calculateProgress(courseId: string) {
  if (!courseId) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Course ID is required',
      },
    };
  }

  return handleRequest('post', `courses/${courseId}/calculate-progress`);
}

/**
 * Get enrolled students for a course
 */
export async function getEnrolledStudents(courseId: string): Promise<ApiResponse<any>> {
  if (!courseId) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Course ID is required',
      },
    };
  }

  return handleRequest('get', `courses/${courseId}/students`);
}

/**
 * Get comprehensive course details with all related data
 * For instructor management interface
 */
export async function getCourseDetails(courseId: string): Promise<ApiResponse<any>> {
  if (!courseId) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Course ID is required',
      },
    };
  }

  return handleRequest('get', `courses/${courseId}/details`);
}
