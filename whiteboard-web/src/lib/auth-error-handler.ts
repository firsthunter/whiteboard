'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Handle authentication errors by redirecting to sign-out page
 */
export function handleAuthError(error: any, router?: any) {
  // Check if it's an authentication error (401, 403, or specific error messages)
  const isAuthError =
    error?.status === 401 ||
    error?.status === 403 ||
    error?.code === 'UNAUTHORIZED' ||
    error?.message?.toLowerCase().includes('unauthorized') ||
    error?.message?.toLowerCase().includes('authentication') ||
    error?.message?.toLowerCase().includes('token') ||
    error?.message?.toLowerCase().includes('expired');

  if (isAuthError) {
    console.warn('Authentication error detected, redirecting to sign-out:', error);

    if (router) {
      // Sign out and redirect to sign-out page
      signOut({ redirect: false }).then(() => {
        router.push('/sign-out?reason=auth_error');
      }).catch((signOutError) => {
        console.error('Error during sign out:', signOutError);
        // Force redirect even if sign out fails
        router.push('/sign-out?reason=auth_error');
      });
    } else {
      // Fallback for when router is not available
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-out?reason=auth_error';
      }
    }

    return true; // Indicate that auth error was handled
  }

  return false; // Not an auth error
}

/**
 * React hook for handling auth errors in components
 */
export function useAuthErrorHandler() {
  const router = useRouter();

  const handleError = (error: any) => {
    return handleAuthError(error, router);
  };

  return handleError;
}