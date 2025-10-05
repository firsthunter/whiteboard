"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Book1,
  Calendar,
  Chart,
  Home2,
  Messages2,
  People,
  Setting2,
} from "iconsax-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home2,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Courses",
    href: "/courses",
    icon: Book1,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
    gradient: "from-orange-500 to-yellow-500",
  },
  {
    name: "Messages",
    href: "/messages",
    icon: Messages2,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: Chart,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    name: "Students",
    href: "/students",
    icon: People,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Setting2,
    gradient: "from-gray-500 to-slate-500",
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col gap-2">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-blue-600 to-purple-600 shadow-lg">
              <span className="text-lg font-bold text-white">WB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight">
                White Board
              </span>
              <span className="text-xs text-muted-foreground">
                Learning Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div
                  className={cn(
                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                    isActive ? "bg-white/20 shadow-inner" : "bg-muted/50"
                  )}
                >
                  <Icon
                    size={20}
                    variant={isActive ? "Bold" : "Linear"}
                    className={isActive ? "text-white" : "text-foreground"}
                  />
                </div>
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600" />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">John Doe</p>
              <p className="truncate text-xs text-muted-foreground">Student</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
