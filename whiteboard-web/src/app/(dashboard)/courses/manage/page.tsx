import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/auth-options";
import { getCourses } from "@/actions/courses";
import { ManageCoursesPageClient } from "@/components/courses/manage-courses-page-client";

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

  return <ManageCoursesPageClient initialCourses={myCourses} />;
}
