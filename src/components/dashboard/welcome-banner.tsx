"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight2 } from "iconsax-react";

export function WelcomeBanner() {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white shadow-2xl">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
        <div className="absolute left-0 top-0 h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 space-y-3 sm:space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            New semester started
          </div>

          <div>
            <h1 className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-bold">
              Welcome back, <span className="wave">👋</span>
              <br />
              John Doe!
            </h1>
            <p className="max-w-md text-sm sm:text-base lg:text-lg text-white/90">
              You have 3 assignments due this week and 2 upcoming exams. Let's
              make this week productive!
            </p>
          </div>

          <Button
            className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto"
            size="lg"
          >
            Get Started
            <ArrowRight2
              size={18}
              className="ml-2 text-primary"
              variant="Bold"
            />
          </Button>
        </motion.div>

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block"
        >
          <div className="relative h-64 w-64">
            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-0 top-0 h-32 w-32 rounded-3xl bg-white/10 backdrop-blur-sm"
            />
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute bottom-10 left-0 h-24 w-24 rounded-2xl bg-white/10 backdrop-blur-sm"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute right-10 top-20 h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm"
            />

            {/* Central illustration element */}
            <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md">
              <div className="text-7xl">📚</div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .wave {
          animation: wave 2.5s infinite;
          display: inline-block;
          transform-origin: 70% 70%;
        }
        @keyframes wave {
          0%,
          100% {
            transform: rotate(0deg);
          }
          10%,
          30% {
            transform: rotate(14deg);
          }
          20% {
            transform: rotate(-8deg);
          }
          40% {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </Card>
  );
}
