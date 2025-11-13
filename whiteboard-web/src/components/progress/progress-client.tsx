'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    GraduationCap,
    BookOpen,
    FileText,
    Award,
    TrendingUp,
    CheckCircle2,
    Clock,
    Target,
    Trophy
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ProgressClientProps {
  courseData: Array<{
    enrollment: any;
    statistics: any;
    certificateEligibility: any;
  }>;
  assignments: any[];
}

export function ProgressClient({ courseData, assignments }: ProgressClientProps) {
  // Calculate overall statistics
  const totalCourses = courseData.length;
  const totalProgress = courseData.reduce((sum, { enrollment }) => sum + (enrollment.progress || 0), 0);
  const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
  
  const totalAssignments = assignments.length;
  const submittedAssignments = assignments.filter(a => a.submissions && a.submissions.length > 0).length;
  const assignmentCompletion = totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0;

  const gradedAssignments = assignments.filter(a => 
    a.submissions && a.submissions.length > 0 && a.submissions[0].grade !== null
  );
  const averageGrade = gradedAssignments.length > 0
    ? Math.round(
        gradedAssignments.reduce((sum, a) => 
          sum + ((a.submissions[0].grade || 0) / a.maxPoints) * 100, 0
        ) / gradedAssignments.length
      )
    : 0;

  const eligibleForCertificate = courseData.filter(({ certificateEligibility }) => 
    certificateEligibility?.eligible
  ).length;

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled courses
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageProgress}%</div>
              <Progress value={averageProgress} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submittedAssignments}/{totalAssignments}</div>
              <p className="text-xs text-muted-foreground">
                {assignmentCompletion}% completed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageGrade}%</div>
              <p className="text-xs text-muted-foreground">
                From {gradedAssignments.length} graded
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Progress */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          {courseData.length > 0 ? (
            courseData.map(({ enrollment, statistics }, index) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {enrollment.course.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{enrollment.course.code}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Link href={`/courses/${enrollment.courseId}`}>
                        <Button variant="outline" size="sm">View Course</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Overall Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Overall Progress</span>
                        <span className="text-muted-foreground">{enrollment.progress || 0}%</span>
                      </div>
                      <Progress value={enrollment.progress || 0} className="h-2" />
                    </div>

                    {/* Statistics Grid */}
                    {statistics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>Modules</span>
                          </div>
                          <p className="text-lg font-semibold">
                            {statistics.completedModules}/{statistics.totalModules}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Target className="h-4 w-4" />
                            <span>Resources</span>
                          </div>
                          <p className="text-lg font-semibold">
                            {statistics.completedResources}/{statistics.totalResources}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>Assignments</span>
                          </div>
                          <p className="text-lg font-semibold">
                            {statistics.completedAssignments}/{statistics.totalAssignments}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award className="h-4 w-4" />
                            <span>Grade</span>
                          </div>
                          <p className="text-lg font-semibold">
                            {enrollment.grade || 0}%
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No enrollments yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Enroll in a course to start tracking your progress
                  </p>
                  <Link href="/courses">
                    <Button>Browse Courses</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          {assignments.length > 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {assignments.map((assignment) => {
                    const submission = assignment.submissions?.[0];
                    const hasSubmitted = !!submission;
                    const isGraded = submission?.grade !== null && submission?.grade !== undefined;
                    const grade = isGraded ? Math.round((submission.grade / assignment.maxPoints) * 100) : 0;

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
                              {hasSubmitted ? (
                                <Badge variant="default" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Submitted
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1">
                                  <Clock className="h-3 w-3" />
                                  Pending
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{assignment.course.code}</span>
                              <span>•</span>
                              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{assignment.maxPoints} points</span>
                            </div>
                          </div>

                          {isGraded && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">{grade}%</div>
                              <p className="text-xs text-muted-foreground">
                                {submission.grade}/{assignment.maxPoints}
                              </p>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No assignments yet</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          {eligibleForCertificate > 0 ? (
            courseData
              .filter(({ certificateEligibility }) => certificateEligibility?.eligible)
              .map(({ enrollment, certificateEligibility }, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {enrollment.course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            You are eligible for a certificate!
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span>{certificateEligibility.progress}% progress</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4 text-green-600" />
                              <span>{certificateEligibility.grade}% grade</span>
                            </div>
                          </div>
                          <Button className="mt-4" size="sm">
                            <Award className="h-4 w-4 mr-2" />
                            Generate Certificate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
          ) : (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No certificates available yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete your courses with good grades to earn certificates
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
                    <p>Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Complete at least 80% of course content</li>
                      <li>Achieve a minimum grade of 70%</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
