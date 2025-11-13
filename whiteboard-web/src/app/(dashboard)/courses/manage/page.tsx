import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/auth-options";
import { getCourses } from "@/actions/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Settings,
  Plus
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ManageCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/signin");
  }

  // Check if user is instructor or admin
  const userRole = session.user?.role?.toLowerCase();
  if (userRole !== "instructor" && userRole !== "admin") {
    redirect("/courses");
  }

  // Get all courses
  const coursesResult = await getCourses();
  
  // Extract courses array from the nested response structure
  const allCourses = coursesResult.success && coursesResult.data 
    ? (coursesResult.data.courses || coursesResult.data.data || [])
    : [];

  // Filter to only courses taught by this instructor (unless admin)
  const myCourses = userRole === "admin" 
    ? allCourses 
    : allCourses.filter((course: any) => course.instructor?.id === session.user?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
          <p className="text-muted-foreground">
            Manage your courses, modules, assignments, and students
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      {myCourses.length === 0 ? (
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
          {myCourses.map((course: any) => (
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
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/courses/${course.id}`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href={`/courses/${course.id}/manage`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
