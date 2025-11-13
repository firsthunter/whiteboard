'use server';

import { revalidatePath } from 'next/cache';
import { handleRequest, buildQueryString } from './utils/handleRequest';
import { ApiResponse } from './utils/types';

export async function getAssignments(courseId?: string): Promise<ApiResponse<any>> {
  const params: Record<string, any> = {};
  if (courseId) {
    params.courseId = courseId;
  }

  const queryString = await buildQueryString(params);

  return handleRequest<any>('get', `assignments${queryString}`);
}

export async function getAssignmentById(id: string): Promise<ApiResponse<any>> {
  return handleRequest<any>('get', `assignments/${id}`);
}

export async function submitAssignment(assignmentId: string, data: { content: string; attachments?: any }): Promise<ApiResponse<any>> {
  const result = await handleRequest<any>('post', `assignments/${assignmentId}/submit`, data);

  if (result.success) {
    revalidatePath('/assignments');
    revalidatePath(`/assignments/${assignmentId}`);
  }

  return result;
}

export async function createAssignment(data: {
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  maxPoints: number;
  courseId: string;
  attachments?: any;
}): Promise<ApiResponse<any>> {
  const result = await handleRequest<any>('post', 'assignments', data);

  if (result.success) {
    revalidatePath('/assignments');
  }

  return result;
}

export async function updateAssignment(
  id: string,
  data: {
    title?: string;
    description?: string;
    instructions?: string;
    dueDate?: string;
    maxPoints?: number;
    attachments?: any;
  }
): Promise<ApiResponse<any>> {
  const result = await handleRequest<any>('patch', `assignments/${id}`, data);

  if (result.success) {
    revalidatePath('/assignments');
    revalidatePath(`/assignments/${id}`);
  }

  return result;
}

export async function deleteAssignment(id: string): Promise<ApiResponse<any>> {
  const result = await handleRequest<any>('delete', `assignments/${id}`);

  if (result.success) {
    revalidatePath('/assignments');
  }

  return result;
}

export async function getAssignmentSubmission(assignmentId: string): Promise<ApiResponse<any>> {
  return handleRequest<any>('get', `assignments/${assignmentId}/submission`);
}

export async function gradeSubmission(
  submissionId: string,
  data: {
    grade: number;
    feedback?: string;
  }
): Promise<ApiResponse<any>> {
  const result = await handleRequest<any>('post', `assignments/submissions/${submissionId}/grade`, data);

  if (result.success) {
    revalidatePath('/assignments');
  }

  return result;
}
