"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
  Users
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const studentNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name :"Ai Study Companion",
    href: "/ai-study",
    icon: Sparkles,
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    name: "My Courses",
    href: "/courses",
    icon: BookOpen,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Assignments",
    href: "/assignments",
    icon: FileText,
    gradient: "from-red-500 to-orange-500",
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
    icon: MessageSquare,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    gradient: "from-gray-500 to-slate-500",
  },
];

const teacherNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Manage Courses",
    href: "/courses/manage",
    icon: GraduationCap,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    name: "Students",
    href: "/students",
    icon: Users,
    gradient: "from-pink-500 to-rose-500",
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
    icon: MessageSquare,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    gradient: "from-gray-500 to-slate-500",
  },
];

const adminNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Courses",
    href: "/courses",
    icon: BookOpen,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Assignments",
    href: "/assignments",
    icon: FileText,
    gradient: "from-red-500 to-orange-500",
  },
  {
    name: "Students",
    href: "/students",
    icon: Users,
    gradient: "from-pink-500 to-rose-500",
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
    icon: MessageSquare,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    gradient: "from-gray-500 to-slate-500",
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const userRole = session?.user?.role?.toLowerCase() || 'student';
  
  let navigation = studentNavigation;
  if (userRole === 'instructor') {
    navigation = teacherNavigation;
  } else if (userRole === 'admin') {
    navigation = adminNavigation;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/signin' });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          "fixed left-0 top-0 z-60 h-screen w-64 border-r bg-sidebar border-sidebar-border transition-transform duration-300 ease-in-out shadow-lg",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
      <div className="flex h-full flex-col gap-2">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6 bg-sidebar/50">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-blue-600 to-purple-600 shadow-lg">
              <span className="text-lg font-bold text-white">WB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight text-sidebar-foreground">
                White Board
              </span>
              <span className="text-xs text-muted-foreground">
                Learning Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/30"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-sidebar-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                    isActive
                      ? `bg-sidebar-primary-foreground/20 backdrop-blur-sm`
                      : "bg-muted/50 group-hover:bg-muted"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground"
                  )} />
                </motion.div>
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-sidebar-border p-4 space-y-2">
          <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{session?.user?.name || 'User'}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {userRole === 'instructor' ? 'Teacher' : userRole}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
    </>
  );
}
