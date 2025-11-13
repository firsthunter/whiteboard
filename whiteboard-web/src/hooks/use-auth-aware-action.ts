'use client';

import { useAuthErrorHandler } from '@/lib/auth-error-handler';

/**
 * Hook that wraps server actions to automatically handle authentication errors
 */
export function useAuthAwareAction() {
  const handleAuthError = useAuthErrorHandler();

  const executeAction = async (
    action: (...args: any[]) => Promise<{ success: boolean; authError?: boolean; error?: any }>,
    ...args: any[]
  ): Promise<{ success: boolean; authError?: boolean; error?: any }> => {
    try {
      const result = await action(...args);

      // Check if the result indicates an auth error
      if (result && typeof result === 'object' && 'authError' in result && result.authError) {
        handleAuthError(result.error);
        // Return the result anyway, but the redirect will happen
        return result;
      }

      return result;
    } catch (error) {
      // Handle any unexpected errors
      console.error('Unexpected error in auth-aware action:', error);
      return { success: false, error };
    }
  };

  return executeAction;
}

/**
 * Higher-order function to wrap server actions with auth error handling
 */
export function withAuthErrorHandling(
  action: (...args: any[]) => Promise<{ success: boolean; authError?: boolean; error?: any }>
) {
  return async (...args: any[]): Promise<{ success: boolean; authError?: boolean; error?: any }> => {
    const result = await action(...args);

    // Check if the result indicates an auth error
    if (result && typeof result === 'object' && 'authError' in result && result.authError) {
      // For server-side usage, we can't redirect directly, but we can return the result
      // The client component using this action should check for authError and handle it
      console.warn('Auth error detected in server action:', result.error);
    }

    return result;
  };
}
