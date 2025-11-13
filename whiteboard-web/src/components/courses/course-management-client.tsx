'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Users, Calendar, BookOpen, FileText, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Course } from '@/actions/utils/types';
import { deleteCourse, getCourseStatistics } from '@/actions/courses';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreateCourseDialog } from './create-course-dialog';
import { EditCourseDialog } from './edit-course-dialog';

interface CourseManagementClientProps {
  initialCourses: Course[];
}

interface CourseStats {
  assignmentsCount: number;
  modulesCount: number;
  resourcesCount: number;
  enrolledStudentsCount: number;
}

export function CourseManagementClient({ initialCourses }: CourseManagementClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [courseStats, setCourseStats] = useState<Record<string, CourseStats>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch course statistics
  useEffect(() => {
    const fetchCourseStats = async () => {
      const statsPromises = courses.map(async (course) => {
        try {
          const result = await getCourseStatistics(course.id);
          if (result.success && result.data) {
            return { courseId: course.id, stats: result.data };
          }
        } catch (error) {
          console.error(`Failed to fetch stats for course ${course.id}:`, error);
        }
        return null;
      });

      const statsResults = await Promise.all(statsPromises);
      const newStats: Record<string, CourseStats> = {};

      statsResults.forEach((result) => {
        if (result) {
          newStats[result.courseId] = result.stats;
        }
      });

      setCourseStats(newStats);
    };

    if (courses.length > 0) {
      void fetchCourseStats();
    }
  }, [courses]);

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

  const handleCourseCreated = async (newCourse: Course) => {
    // Update local state immediately for instant feedback
    setCourses([newCourse, ...courses]);
    setShowCreateDialog(false);
    
    // Refresh the server data
    router.refresh();
  };

  const handleCourseUpdated = async (updatedCourse: Course) => {
    // Update local state immediately for instant feedback
    setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    setEditingCourse(null);
    
    // Refresh the server data
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                📚
              </div>
              <h3 className="text-lg font-semibold">No courses yet</h3>
              <p className="text-muted-foreground mt-2">
                Get started by creating your first course
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Course
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg line-clamp-1">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {course.code}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrollmentCount || 0}/{course.maxEnrollment}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(course.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Course Statistics */}
                    <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span>{courseStats[course.id]?.assignmentsCount || 0} assignments</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-green-500" />
                        <span>{courseStats[course.id]?.modulesCount || 0} modules</span>
                      </div>
                    </div>

                    {course.schedule && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Schedule: </span>
                        <span>{course.schedule}</span>
                      </div>
                    )}

                    {course.location && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Location: </span>
                        <span>{course.location}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => router.push(`/courses/${course.id}/manage`)}
                      >
                        <Settings className="h-4 w-4" />
                        Manage Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setEditingCourse(course)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(course.id)}
                        disabled={deletingId === course.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === course.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <CreateCourseDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCourseCreated={handleCourseCreated}
      />

      {editingCourse && (
        <EditCourseDialog
          course={editingCourse}
          open={!!editingCourse}
          onClose={() => setEditingCourse(null)}
          onCourseUpdated={handleCourseUpdated}
        />
      )}
    </div>
  );
}
