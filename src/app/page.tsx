"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-2xl"
        >
          <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
            WB
          </span>
        </motion.div>
        <h1 className="mb-2 text-3xl font-bold text-white">White Board</h1>
        <p className="text-white/80">Modern Learning Platform</p>
        <motion.div
          className="mt-8"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="mx-auto h-1 w-32 rounded-full bg-white/30">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5 }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
