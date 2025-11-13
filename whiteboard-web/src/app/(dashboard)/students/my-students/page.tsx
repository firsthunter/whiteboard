import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { redirect } from 'next/navigation';
import { getCourses } from '@/actions/courses';
import { MyStudentsClient } from '@/components/students/my-students-client';

export default async function MyStudentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect('/sign-out');
  }

  // Only allow instructors to access this page
  if (session.user?.role !== 'INSTRUCTOR') {
    redirect('/students');
  }

  // Get instructor's courses
  const coursesResult = await getCourses({ instructorId: session.user.id });
  const instructorCourses = coursesResult.success && coursesResult.data ? coursesResult.data.data || [] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
        <p className="text-muted-foreground">
          View and manage students enrolled in your courses
        </p>
      </div>

      <MyStudentsClient instructorCourses={instructorCourses} />
    </div>
  );
}
