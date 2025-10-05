"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ArrowRight2 } from "iconsax-react";

const courses = [
  {
    id: 1,
    name: "Advanced Mathematics",
    instructor: "Dr. Sarah Johnson",
    progress: 75,
    color: "bg-blue-500",
    nextClass: "Tomorrow, 10:00 AM",
  },
  {
    id: 2,
    name: "Physics Laboratory",
    instructor: "Prof. Michael Chen",
    progress: 60,
    color: "bg-purple-500",
    nextClass: "Friday, 2:00 PM",
  },
  {
    id: 3,
    name: "Computer Science 101",
    instructor: "Dr. Emily Brown",
    progress: 85,
    color: "bg-green-500",
    nextClass: "Today, 3:00 PM",
  },
];

export function RecentCourses() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Courses</CardTitle>
        <Button variant="ghost" size="sm">
          View All
          <ArrowRight2 size={16} className="ml-2 text-primary" variant="Bold" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">{course.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {course.instructor}
                </p>
                <p className="text-xs text-muted-foreground">
                  Next: {course.nextClass}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{course.progress}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={course.progress} className="h-2" />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
