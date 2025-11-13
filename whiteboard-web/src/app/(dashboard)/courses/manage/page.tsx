import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/auth-options";
import { getCourses } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ManageCoursesClient } from "@/components/courses/manage-courses-client";

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

      <ManageCoursesClient initialCourses={myCourses} />
    </div>
  );
}
