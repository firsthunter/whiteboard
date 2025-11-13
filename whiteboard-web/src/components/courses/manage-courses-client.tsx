'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import {
    Users,
    Calendar,
    Settings,
    Edit,
    Trash2
} from "lucide-react";
import { deleteCourse } from "@/actions/courses";
import { toast } from "sonner";
import { EditCourseDialog } from "./edit-course-dialog";
import { Course } from "@/actions/utils/types";

interface ManageCoursesClientProps {
  initialCourses: Course[];
}

export function ManageCoursesClient({ initialCourses }: ManageCoursesClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setDeletingId(courseId);
    try {
      const result = await deleteCourse(courseId);
      if (result.success) {
        setCourses(courses.filter(c => c.id !== courseId));
        toast.success('Course deleted successfully!');
      } else {
        toast.error(result.error?.message || 'Failed to delete course');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCourseUpdated = (updatedCourse: Course) => {
    setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    setEditingCourse(null);
  };

  return (
    <>
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              title="No courses to manage"
              description="Create your first course to get started"
              icon="📚"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: Course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {course.code}
                    </Badge>
                  </div>
                  <div className="text-4xl">📚</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollmentCount || 0} students enrolled</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" asChild>
                    <Link href={`/courses/${course.id}/manage`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditingCourse(course)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(course.id)}
                    disabled={deletingId === course.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deletingId === course.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingCourse && (
        <EditCourseDialog
          course={editingCourse}
          open={!!editingCourse}
          onClose={() => setEditingCourse(null)}
          onCourseUpdated={handleCourseUpdated}
        />
      )}
    </>
  );
}