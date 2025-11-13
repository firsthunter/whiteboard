import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { redirect } from 'next/navigation';
import { getCourseById, getMyEnrollments, enrollInCourse, getEnrolledStudents } from '@/actions/courses';
import { getAssignments } from '@/actions/assignments';
import { getCourseModules } from '@/actions/modules';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CourseEnrollButton } from '@/components/courses/course-enroll-button';
import Link from 'next/link';
import {
    Users,
    Calendar,
    FileText,
    Award,
    GraduationCap,
    BookOpen,
    PlayCircle,
    FileTextIcon,
    CheckCircle2
} from 'lucide-react';
import { Assignment } from '@/actions/utils/types';

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-out');
  }

  const resolvedParams = await params;
  
  // Step 1: Fetch course and enrollments first
  const [courseResult, enrollmentsResult] = await Promise.all([
    getCourseById(resolvedParams.id),
    getMyEnrollments(),
  ]);

  if (!courseResult.success) {
    return redirect('/courses')
  }
    
  const course = courseResult.data;
  if (!course) {
    return redirect('/courses')
  }

  const enrollments = enrollmentsResult.success ? enrollmentsResult.data || [] : [];
  let isEnrolled = enrollments.some(e => e.courseId === course.id);
  let enrollment = enrollments.find(e => e.courseId === course.id);
  const isInstructor = course.instructor?.id === session.user?.id;

  // Step 2: Auto-enroll students when they first access a course
  if (!isEnrolled && !isInstructor && session.user?.role?.toUpperCase() === 'STUDENT') {
    const enrollResult = await enrollInCourse(course.id);
    if (enrollResult.success) {
      isEnrolled = true;
      enrollment = enrollResult.data;
      console.log(`✅ Auto-enrolled student ${session.user.name} in course ${course.title}`);
    }
  }

  // Step 3: Now fetch modules, assignments, and enrolled students (after enrollment is confirmed)
  const [assignmentsResult, modulesResult, studentsResult] = await Promise.all([
    getAssignments(resolvedParams.id),
    getCourseModules(resolvedParams.id),
    getEnrolledStudents(resolvedParams.id),
  ]);

  if (!assignmentsResult.success) {
    return redirect('/courses')
  }

  const assignments = assignmentsResult.data?.assignments || [];
  const modules = modulesResult.success ? modulesResult.data || [] : [];
  const enrolledStudents = studentsResult.success ? studentsResult.data?.students || [] : [];

  // Debug logging
  console.log('Course Detail Debug:', {
    courseId: resolvedParams.id,
    isInstructor,
    isEnrolled,
    userRole: session.user?.role,
    assignmentsCount: assignments.length,
    modulesCount: modules.length,
    modulesResult: {
      success: modulesResult.success,
      error: modulesResult.error,
      dataLength: modulesResult.data?.length
    }
  });

  // Handle module loading errors
  const modulesError = !modulesResult.success ? modulesResult.error : null;

  // Log errors if any
  if (!modulesResult.success) {
    console.error('Failed to load modules:', modulesResult.error);
  }
  if (!studentsResult.success) {
    console.error('Failed to load students:', studentsResult.error);
  }

  const enrollmentCount = course.enrollmentCount || 0;
  const assignmentCount = assignments?.length || 0;
  const completedAssignments = assignments?.filter((a: Assignment) => (a.submissions?.length ?? 0) > 0).length || 0;
  
  // Calculate module progress
  // Count total resources and resources marked as completed
  const totalResources = modules.reduce((sum, m) => sum + (m.resources?.length || 0), 0);
  const completedResources = modules.reduce((sum, m) => {
    return sum + (m.resources?.filter((r: any) => {
      const progress = r.progress;
      // Progress can be an array or a single object
      if (Array.isArray(progress)) {
        return progress.length > 0 && progress[0]?.isCompleted;
      }
      return progress?.isCompleted;
    }).length || 0);
  }, 0);
  const moduleProgress = totalResources > 0 ? (completedResources / totalResources) * 100 : 0;
  
  // Calculate overall progress based on all completable items (assignments + resources)
  const totalCompletableItems = assignmentCount + totalResources;
  const totalCompletedItems = completedAssignments + completedResources;
  const overallProgress = totalCompletableItems > 0 ? (totalCompletedItems / totalCompletableItems) * 100 : 0;

  // Debug module rendering
  console.log('Final module debug before render:', {
    modulesLength: modules.length,
    modules: modules.map(m => ({ id: m.id, title: m.title })),
    isEnrolled,
    isInstructor,
    modulesError,
    modulesResult: {
      success: modulesResult.success,
      error: modulesResult.error
    }
  });

    return (
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{course.title}</h1>
                <Badge>{course.code}</Badge>
                {isEnrolled && !isInstructor && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Enrolled
                  </Badge>
                )}
                {isInstructor && (
                  <Badge variant="default" className="bg-purple-600">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Instructor
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg">{course.description}</p>
            </div>
            <div className="flex gap-2">
              {isInstructor && (
                <Link href={`/courses/${resolvedParams.id}/manage`}>
                  <Button size="lg" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Manage Course
                  </Button>
                </Link>
              )}
              {isEnrolled && !isInstructor && (
                <Link href={`/courses/${resolvedParams.id}/learn`}>
                  <Button size="lg" className="gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Continue Learning
                  </Button>
                </Link>
              )}
              {!isEnrolled && !isInstructor && (
                <CourseEnrollButton courseId={course.id} />
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enrollmentCount}</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{assignmentCount}</p>
                  <p className="text-sm text-muted-foreground">Assignments</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedAssignments}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
                  <p className="text-sm text-muted-foreground">Progress</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules ({modules.length})</TabsTrigger>
            <TabsTrigger value="assignments">Assignments ({assignmentCount})</TabsTrigger>
            <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
            <TabsTrigger value="students">Students ({enrollmentCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Course Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {course.description}
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Course Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
                  </div>
                  <Progress value={overallProgress} />
                </div>
                <p className="text-sm text-muted-foreground">
                  You have completed {completedAssignments} out of {assignmentCount} assignments.
                </p>
              </div>
            </Card>

            {assignments && assignments.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Upcoming Assignments</h2>
                  <Link href="/assignments">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {assignments.slice(0, 3).map((assignment: Assignment) => (
                    <Link
                      key={assignment.id}
                      href={`/assignments/${assignment.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={(assignment.submissions?.length ?? 0) > 0 ? 'default' : 'outline'}>
                          {(assignment.submissions?.length ?? 0) > 0 ? 'Submitted' : 'Pending'}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            {(() => {
              console.log('Modules tab rendering:', { modules, modulesError, isEnrolled, modulesLength: modules?.length });
              return null;
            })()}
            {modulesError ? (
              <Card className="p-6">
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2 text-destructive">Failed to Load Modules</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {modulesError.message || 'Unable to load course modules. Please try refreshing the page.'}
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              </Card>
            ) : modules && modules.length > 0 ? (
              <>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Course Modules</h2>
                    {isEnrolled && (
                      <Link href={`/courses/${resolvedParams.id}/learn`}>
                        <Button>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start Learning
                        </Button>
                      </Link>
                    )}
                  </div>
                  
                  {moduleProgress > 0 && (
                    <div className="mb-6 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Module Progress</span>
                        <span className="text-muted-foreground">
                          {Math.round(moduleProgress)}% ({completedResources}/{totalResources} resources)
                        </span>
                      </div>
                      <Progress value={moduleProgress} />
                    </div>
                  )}

                  <div className="space-y-4">
                    {modules.map((module, index) => {
                      console.log('Rendering module:', index, module);
                      return (
                        <Card key={module.id} className="p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-base">
                                    {index + 1}. {module.title}
                                  </h3>
                                  {module.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {module.description}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="secondary" className="flex-shrink-0">
                                  Order {module.order}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <FileTextIcon className="h-4 w-4" />
                                  <span>{module.resources?.length || 0} resources</span>
                                </div>
                              </div>

                              {isEnrolled && (
                                <Link href={`/courses/${resolvedParams.id}/learn`}>
                                  <Button variant="outline" size="sm" className="mt-3">
                                    View Resources
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </Card>
                
                {!isEnrolled && (
                  <Card className="p-6 bg-muted/50">
                    <div className="text-center">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="font-semibold mb-2">Enroll to Access Modules</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enroll in this course to access all {modules.length} modules and start learning.
                      </p>
                      <CourseEnrollButton courseId={course.id} />
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-6">
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No modules available yet</p>
                  {isInstructor && (
                    <Link href={`/courses/${resolvedParams.id}/manage`}>
                      <Button className="mt-4">Add Modules</Button>
                    </Link>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assignments">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">All Assignments</h2>
              {assignments && assignments.length > 0 ? (
                <div className="space-y-3">
                  {assignments.map((assignment: Assignment) => {
                    const submission = assignment.submissions?.[0];
                    const isOverdue = new Date(assignment.dueDate) < new Date();

                    return (
                      <Link
                        key={assignment.id}
                        href={`/assignments/${assignment.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{assignment.title}</p>
                              {submission ? (
                                <Badge variant={submission.status === 'GRADED' ? 'default' : 'secondary'} className="bg-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  {submission.status || 'Submitted'}
                                </Badge>
                              ) : isOverdue ? (
                                <Badge variant="destructive">Overdue</Badge>
                              ) : (
                                <Badge variant="outline">Not Submitted</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                {assignment.maxPoints} points
                              </span>
                              {submission && submission.grade !== null && submission.grade !== undefined && (
                                <span className="text-green-600 font-medium">
                                  Grade: {submission.grade}/{assignment.maxPoints}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No assignments yet</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="syllabus">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Course Syllabus</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground">
                  The detailed syllabus for this course will be available soon. It will include:
                </p>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li>Course objectives and learning outcomes</li>
                  <li>Weekly topics and schedule</li>
                  <li>Required and recommended materials</li>
                  <li>Grading policy and assessment criteria</li>
                  <li>Course policies and expectations</li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Enrolled Students</h2>
              
              {enrolledStudents && enrolledStudents.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{enrolledStudents.length} students enrolled</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {enrolledStudents.map((student: any) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 hover:text-accent-foreground transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {student.avatar ? (
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-primary">
                                {student.name?.charAt(0).toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">Progress</p>
                            <p className="text-sm text-muted-foreground">
                              {Math.round(student.progress || 0)}%
                            </p>
                          </div>
                          <Badge variant="outline">
                            Enrolled {new Date(student.enrolledAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No students enrolled yet</p>
                  {isInstructor && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Students will appear here once they enroll in your course
                    </p>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
 
}
