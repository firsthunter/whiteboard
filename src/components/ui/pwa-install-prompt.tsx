"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AddCircle, CloseCircle } from "iconsax-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { Card } from "./card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after 3 seconds if user hasn't dismissed it before
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50"
        >
          <Card className="p-4 shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg">
                <span className="text-xl font-bold text-white">WB</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base">
                  Install White Board
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Install our app for quick access and offline features
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleInstall}
                    className="flex-1 sm:flex-initial"
                  >
                    <AddCircle size={16} className="mr-1" />
                    Install
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="flex-shrink-0"
                  >
                    <CloseCircle size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
