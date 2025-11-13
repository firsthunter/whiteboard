import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { getCourses, getMyEnrollments } from "@/actions/courses";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth-options";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  // Get session
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    redirect('/sign-out');
  }

  // Fetch all courses and user enrollments
  const [coursesResult, enrollmentsResult] = await Promise.all([
    getCourses(),
    getMyEnrollments(),
  ]);  

  const courses = coursesResult.success ? coursesResult.data?.courses || [] : [];
  const enrollments = enrollmentsResult.success ? enrollmentsResult.data || [] : [];
  
  // Create a map of enrolled course IDs
  const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));

  // Separate enrolled and available courses
  const enrolledCourses = courses.filter((c: any) => enrolledCourseIds.has(c.id));
  const availableCourses = courses.filter((c: any) => !enrolledCourseIds.has(c.id));

  // Check if user is an instructor
  const isInstructor = session.user?.role?.toLowerCase() === 'instructor' || session.user?.role?.toLowerCase() === 'admin';

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Courses</h1>
            <p className="text-muted-foreground mt-1">
              Browse and manage your courses
            </p>
          </div>
          {isInstructor && (
            <Button asChild>
              <Link href="/courses/manage">Manage My Courses</Link>
            </Button>
          )}
        </div>

        {/* My Courses Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Courses ({enrolledCourses.length})</h2>
          
          {enrolledCourses.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  title="No enrolled courses"
                  description="Start learning by enrolling in a course below"
                  icon="📚"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course: any) => {
                const enrollment = enrollments.find(e => e.courseId === course.id);
                return (
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
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{enrollment?.progress || 0}%</span>
                        </div>
                        <Progress value={enrollment?.progress || 0} className="h-2" />
                      </div>

                      {enrollment?.grade && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Grade</span>
                          <span className="font-semibold">{enrollment.grade}%</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="default" size="sm" className="flex-1" asChild>
                          <Link href={`/courses/${course.id}`}>
                            View Course
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          Continue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Courses Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Courses ({availableCourses.length})</h2>
          
          {availableCourses.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  title="No available courses"
                  description="All courses have been enrolled or no courses are available"
                  icon="🎓"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {availableCourses.map((course: any) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {course.code}
                        </Badge>
                      </div>
                      <div className="text-4xl">🎓</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span>
                          {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      {course.location && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location</span>
                          <span>{course.location}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Students</span>
                        <span>{course.maxEnrollment}</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0" asChild>
                      <Link href={`/courses/${course.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
