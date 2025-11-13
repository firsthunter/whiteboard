'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';
import { OfflineProvider } from '@/contexts/offline-context';
import { WebSocketProvider } from '@/contexts/websocket-context';
import { BackgroundSyncProvider } from '@/components/background-sync-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OfflineProvider>
        <WebSocketProvider>
          <BackgroundSyncProvider />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </WebSocketProvider>
      </OfflineProvider>
    </SessionProvider>
  );
}
