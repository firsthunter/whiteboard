"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Calendar } from "lucide-react";

interface RecentAssignmentsProps {
  assignments?: any[];
}

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

export function RecentAssignments({ assignments = [] }: RecentAssignmentsProps) {
  // Get upcoming assignments (not submitted, sorted by due date)
  const now = new Date();
  const upcomingAssignments = assignments
    .filter((a: any) => a.submissions.length === 0)
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days left`;
  };

  const getPriority = (dueDate: string): 'high' | 'medium' | 'low' => {
    const days = Math.ceil((new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0 || days <= 2) return 'high';
    if (days <= 5) return 'medium';
    return 'low';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            Recent Assignments
          </CardTitle>
          <Link href="/assignments">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingAssignments.length === 0 ? (
          <EmptyState
            title="No pending assignments"
            description="All your assignments are up to date!"
            icon={<FileText size={64} />}
          />
        ) : (
          <>
            {upcomingAssignments.map((assignment: any, index: number) => {
              const priority = getPriority(assignment.dueDate);
              const daysText = getDaysUntilDue(assignment.dueDate);
              const isOverdue = new Date(assignment.dueDate) < now;

              return (
                <Link key={assignment.id} href={`/assignments/${assignment.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm">{assignment.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {assignment.course.code} - {assignment.course.title}
                          </p>
                        </div>
                        {isOverdue ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className={priorityColors[priority]}
                          >
                            {priority}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {daysText}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {assignment.maxPoints} points
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}
