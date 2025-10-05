"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  HambergerMenu,
  Notification,
  SearchNormal1,
  Setting2,
} from "iconsax-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden hover:bg-accent"
        onClick={onMenuClick}
      >
        <HambergerMenu size={24} className="text-foreground" variant="Bold" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <SearchNormal1
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
            variant="Linear"
          />
          <Input
            type="search"
            placeholder="Search courses, students, messages..."
            className="w-full pl-10 bg-muted/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Notification
                size={20}
                className="text-foreground sm:w-5 sm:h-5"
                variant="Bold"
              />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start py-3">
                <p className="font-medium">New assignment posted</p>
                <p className="text-xs text-muted-foreground">
                  Mathematics - Calculus Chapter 5
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  2 hours ago
                </p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-3">
                <p className="font-medium">Grade updated</p>
                <p className="text-xs text-muted-foreground">
                  Physics - Lab Report: 95/100
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  5 hours ago
                </p>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Setting2 size={20} className="text-foreground" variant="Bold" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Help & Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
