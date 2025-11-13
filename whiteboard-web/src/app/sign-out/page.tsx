'use client';

import { signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

function SignOutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl') || '/signin';
  const reason = searchParams.get('reason');

  // Determine message based on reason
  const getSignOutMessage = () => {
    switch (reason) {
      case 'auth_error':
        return {
          title: 'Session Expired',
          description: 'Your session has expired or is invalid. Please sign in again.',
          icon: '⚠️'
        };
      case 'unauthorized':
        return {
          title: 'Access Denied',
          description: 'You do not have permission to access this resource.',
          icon: '🚫'
        };
      case 'token_expired':
        return {
          title: 'Token Expired',
          description: 'Your authentication token has expired. Please sign in again.',
          icon: '⏰'
        };
      default:
        return {
          title: 'Signing Out',
          description: 'Please wait while we sign you out securely...',
          icon: '👋'
        };
    }
  };

  const message = getSignOutMessage();

  useEffect(() => {
    const handleSignOut = async () => {
      setIsSigningOut(true);
      try {
        await signOut({
          redirect: false,
        });
      } catch (error) {
        console.error('Sign out error:', error);
      } finally {
        // Always clear storage and redirect, even if signOut fails
        try {
          localStorage.clear();
          sessionStorage.clear();
          
          // Clear any NextAuth cookies manually as fallback
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
        } catch (storageError) {
          console.error('Storage cleanup error:', storageError);
        }
        
        // Redirect after a short delay to show the signing out message
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 1000);
      }
    };

    // Automatically sign out when the page loads
    void handleSignOut();
  }, [router, callbackUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <span className="text-2xl">{message.icon}</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {message.title}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {message.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isSigningOut ? 'Signing out...' : 'Redirecting...'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Clearing session data and tokens for security.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/signin')}
              className="w-full"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function SignOutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    }>
      <SignOutContent />
    </Suspense>
  );
}