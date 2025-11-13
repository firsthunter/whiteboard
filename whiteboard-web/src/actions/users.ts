'use server';

import { z } from 'zod';
import { handleRequest, buildQueryString } from './utils/handleRequest';
import { ApiResponse, User, PaginatedResponse, Role } from './utils/types';

// Validation Schemas
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(Role).optional(),
});

const UpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  avatar: z.string().url().or(z.literal('')).optional(),
  bio: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
});

const QueryUsersSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
});

// Types
type CreateUserInput = z.infer<typeof CreateUserSchema>;
type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
type QueryUsersInput = z.infer<typeof QueryUsersSchema>;

/**
 * Get all users with optional filters
 */
export async function getUsers(
  params: QueryUsersInput = {},
): Promise<ApiResponse<PaginatedResponse<User>>> {
  // Validate input
  const validation = QueryUsersSchema.safeParse(params);

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

  return handleRequest<PaginatedResponse<User>>('get', `users${queryString}`);
}

/**
 * Get user by ID
 */
export async function getUserById(
  userId: string,
): Promise<ApiResponse<User>> {
  if (!userId) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'User ID is required',
      },
    };
  }

  return handleRequest<User>('get', `users/${userId}`);
}

/**
 * Create a new user (Admin only)
 */
export async function createUser(
  input: CreateUserInput,
): Promise<ApiResponse<User>> {
  // Validate input
  const validation = CreateUserSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.error.issues[0].message,
      },
    };
  }

  return handleRequest<User>('post', 'auth/register', validation.data, false);
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  input: UpdateUserInput,
): Promise<ApiResponse<User>> {
  // Validate input
  const validation = UpdateUserSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.error.issues[0].message,
      },
    };
  }

  return handleRequest<User>('patch', `users/${userId}`, validation.data);
}

/**
 * Delete user (Admin only)
 */
export async function deleteUser(
  userId: string,
): Promise<ApiResponse<void>> {
  if (!userId) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'User ID is required',
      },
    };
  }

  return handleRequest<void>('delete', `users/${userId}`);
}

/**
 * Update current user's profile
 */
export async function updateMyProfile(
  input: UpdateUserInput,
): Promise<ApiResponse<User>> {
  // Validate input
  const validation = UpdateUserSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.error.issues[0].message,
      },
    };
  }

  return handleRequest<User>('patch', 'users/me/profile', validation.data);
}

/**
 * Upload avatar for current user
 */
export async function uploadAvatar(formData: FormData): Promise<ApiResponse<{ avatar: string }>> {
  return handleRequest<{ avatar: string }>('post', 'users/me/avatar', formData);
}

/**
 * Change current user's password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ApiResponse<void>> {
  return handleRequest<void>('patch', 'users/me/password', { 
    currentPassword, 
    newPassword 
  });
}
