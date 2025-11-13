'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    BookOpen,
    FileText,
    CheckCircle,
    Clock,
    TrendingUp,
    Award
} from 'lucide-react';

interface CourseAnalyticsProps {
  courseId: string;
  courseDetails: any;
}

export function CourseAnalytics({ courseDetails }: CourseAnalyticsProps) {
  const { stats, enrollments, modules, assignments } = courseDetails;

  // Calculate completion stats
  const completedStudents = enrollments.filter((e: any) => e.progress === 100).length;
  const inProgressStudents = enrollments.filter((e: any) => e.progress > 0 && e.progress < 100).length;
  const notStartedStudents = enrollments.filter((e: any) => e.progress === 0).length;

  // Calculate assignment submission rate
  const totalPossibleSubmissions = assignments.length * enrollments.length;
  const actualSubmissions = assignments.reduce((sum: number, a: any) => 
    sum + (a._count?.submissions || a.submissionCount || 0), 0
  );
  const submissionRate = totalPossibleSubmissions > 0 
    ? Math.round((actualSubmissions / totalPossibleSubmissions) * 100)
    : 0;

  // Get top performers
  const topPerformers = [...enrollments]
    .sort((a: any, b: any) => b.progress - a.progress)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Course Analytics</h2>
        <p className="text-muted-foreground">Performance metrics and insights</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEnrollments}</div>
            <Progress value={100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageProgress}%</div>
            <Progress value={stats.averageProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedStudents}</div>
            <Progress 
              value={stats.totalEnrollments > 0 ? (completedStudents / stats.totalEnrollments) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Submission Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{submissionRate}%</div>
            <Progress value={submissionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Student Progress Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Student Progress Distribution</CardTitle>
          <CardDescription>Breakdown of student engagement levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Completed (100%)</span>
                </div>
                <Badge variant="secondary">{completedStudents} students</Badge>
              </div>
              <Progress 
                value={stats.totalEnrollments > 0 ? (completedStudents / stats.totalEnrollments) * 100 : 0}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">In Progress (1-99%)</span>
                </div>
                <Badge variant="secondary">{inProgressStudents} students</Badge>
              </div>
              <Progress 
                value={stats.totalEnrollments > 0 ? (inProgressStudents / stats.totalEnrollments) * 100 : 0}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Not Started (0%)</span>
                </div>
                <Badge variant="secondary">{notStartedStudents} students</Badge>
              </div>
              <Progress 
                value={stats.totalEnrollments > 0 ? (notStartedStudents / stats.totalEnrollments) * 100 : 0}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performers
            </CardTitle>
            <CardDescription>Students with highest progress</CardDescription>
          </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No students enrolled yet
              </p>
            ) : (
              <div className="space-y-4">
                {topPerformers.map((student: any, index: number) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{student.studentName}</p>
                      <Progress value={student.progress} className="h-2 mt-1" />
                    </div>
                    <Badge variant="secondary">{student.progress}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Module Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Module Engagement
            </CardTitle>
            <CardDescription>Resource completion by module</CardDescription>
          </CardHeader>
          <CardContent>
            {modules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No modules created yet
              </p>
            ) : (
              <div className="space-y-4">
                {modules.slice(0, 5).map((module: any) => {
                  const completionRate = stats.totalEnrollments > 0 && module.completedCount
                    ? Math.round((module.completedCount / stats.totalEnrollments) * 100)
                    : 0;
                  
                  return (
                    <div key={module.id}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium truncate">{module.title}</p>
                        <Badge variant="outline">{module.resourceCount} resources</Badge>
                      </div>
                      <Progress value={completionRate} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {completionRate}% average completion
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content Summary</CardTitle>
          <CardDescription>Overview of available learning materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.totalModules}</div>
              <p className="text-sm text-muted-foreground">Modules</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.totalResources}</div>
              <p className="text-sm text-muted-foreground">Resources</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.totalAssignments}</div>
              <p className="text-sm text-muted-foreground">Assignments</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
              <p className="text-sm text-muted-foreground">Quizzes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
