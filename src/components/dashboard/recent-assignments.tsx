"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { DocumentText, Star1 } from "iconsax-react";

const assignments = [
  {
    id: 1,
    title: "Calculus Problem Set 5",
    course: "Mathematics",
    dueDate: "2 days",
    priority: "high",
    status: "pending",
  },
  {
    id: 2,
    title: "Lab Report: Newton's Laws",
    course: "Physics",
    dueDate: "4 days",
    priority: "medium",
    status: "in-progress",
  },
  {
    id: 3,
    title: "Algorithm Analysis Essay",
    course: "Computer Science",
    dueDate: "1 week",
    priority: "low",
    status: "pending",
  },
];

const priorityColors = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
};

const statusColors = {
  pending: "bg-gray-500/10 text-gray-500",
  "in-progress": "bg-blue-500/10 text-blue-500",
  completed: "bg-green-500/10 text-green-500",
};

export function RecentAssignments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DocumentText size={20} variant="Bold" className="text-purple-600" />
          Recent Assignments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignments.map((assignment, index) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">{assignment.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {assignment.course}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    priorityColors[
                      assignment.priority as keyof typeof priorityColors
                    ]
                  }
                >
                  <Star1 size={12} variant="Bold" className="mr-1" />
                  {assignment.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={
                    statusColors[assignment.status as keyof typeof statusColors]
                  }
                >
                  {assignment.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Due in {assignment.dueDate}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
