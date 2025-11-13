'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ModuleManager } from './module-manager';
import { CourseAnnouncementsManager } from './course-announcements-manager';
import { CourseAssignmentsManager } from './course-assignments-manager';
import { CourseAnalytics } from './course-analytics';
import { EnrolledStudents } from '@/components/students/enrolled-students';
import {
  BookOpen,
  FileText,
  Megaphone,
  Users,
  BarChart3,
  Info
} from 'lucide-react';
import { getCourseDetails } from '@/actions/courses';
import { toast } from 'sonner';

interface CourseDetailsTabsProps {
  courseId: string;
}

interface CourseDetails {
  course: any;
  modules: any[];
  assignments: any[];
  announcements: any[];
  quizzes: any[];
  enrollments: any[];
  stats: {
    totalModules: number;
    totalResources: number;
    totalAssignments: number;
    totalAnnouncements: number;
    totalQuizzes: number;
    totalEnrollments: number;
    averageProgress: number;
  };
}

export function CourseDetailsTabs({ courseId }: CourseDetailsTabsProps) {
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const loadCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getCourseDetails(courseId);
      
      console.log('CourseDetailsTabs Debug:', {
        courseId,
        success: result.success,
        error: result.error,
        hasData: !!result.data,
        modulesCount: result.data?.modules?.length || 0,
        stats: result.data?.stats
      });
      
      if (result.success && result.data) {
        setCourseDetails(result.data);
      } else {
        console.error('Failed to load course details:', result.error);
        toast.error(result.error?.message || 'Failed to load course details');
      }
    } catch (error) {
      console.error('Error loading course details:', error);
      toast.error('An error occurred while loading course details');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadCourseDetails();
  }, [loadCourseDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            Failed to load course details. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6 mb-6">
        <TabsTrigger value="overview" className="gap-2">
          <Info className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="modules" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Modules ({courseDetails.stats.totalModules})
        </TabsTrigger>
        <TabsTrigger value="assignments" className="gap-2">
          <FileText className="h-4 w-4" />
          Assignments ({courseDetails.stats.totalAssignments})
        </TabsTrigger>
        <TabsTrigger value="announcements" className="gap-2">
          <Megaphone className="h-4 w-4" />
          Announcements ({courseDetails.stats.totalAnnouncements})
        </TabsTrigger>
        <TabsTrigger value="students" className="gap-2">
          <Users className="h-4 w-4" />
          Students ({courseDetails.stats.totalEnrollments})
        </TabsTrigger>
        <TabsTrigger value="analytics" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseDetails.stats.totalModules}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {courseDetails.stats.totalResources} resources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseDetails.stats.totalAssignments}</div>
              <p className="text-xs text-muted-foreground mt-1">Active assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseDetails.stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg progress: {courseDetails.stats.averageProgress}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseDetails.stats.totalAnnouncements}</div>
              <p className="text-xs text-muted-foreground mt-1">Course updates</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Basic details about this course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Course Code</label>
              <p className="text-sm text-muted-foreground">{courseDetails.course.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="text-sm text-muted-foreground">{courseDetails.course.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(courseDetails.course.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(courseDetails.course.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            {courseDetails.course.schedule && (
              <div>
                <label className="text-sm font-medium">Schedule</label>
                <p className="text-sm text-muted-foreground">{courseDetails.course.schedule}</p>
              </div>
            )}
            {courseDetails.course.location && (
              <div>
                <label className="text-sm font-medium">Location</label>
                <p className="text-sm text-muted-foreground">{courseDetails.course.location}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Modules Tab */}
      <TabsContent value="modules">
        <ModuleManager courseId={courseId} />
      </TabsContent>

      {/* Assignments Tab */}
      <TabsContent value="assignments">
        <CourseAssignmentsManager 
          courseId={courseId} 
          assignments={courseDetails.assignments}
          onUpdate={loadCourseDetails}
        />
      </TabsContent>

      {/* Announcements Tab */}
      <TabsContent value="announcements">
        <CourseAnnouncementsManager 
          courseId={courseId}
          announcements={courseDetails.announcements}
          onUpdate={loadCourseDetails}
        />
      </TabsContent>

      {/* Students Tab */}
      <TabsContent value="students">
        <EnrolledStudents courseId={courseId} />
      </TabsContent>

      {/* Analytics Tab */}
      <TabsContent value="analytics">
        <CourseAnalytics 
          courseId={courseId}
          courseDetails={courseDetails}
        />
      </TabsContent>
    </Tabs>
  );
}
