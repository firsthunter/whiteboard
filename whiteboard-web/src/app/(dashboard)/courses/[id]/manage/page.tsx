import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { redirect } from 'next/navigation';
import { getCourseById } from '@/actions/courses';
import { CourseDetailsTabs } from '@/components/courses/course-details-tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function CourseManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-out');
  }

  const courseId = (await params).id;
  const courseResult = await getCourseById(courseId);

  if (!courseResult.success || !courseResult.data) {
    return redirect('/courses/manage')
  }

  const course = courseResult.data;

  // Check if user is the instructor
  if (course.instructor?.id !== session.user?.id) {
    redirect(`/courses/${courseId}`);
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/courses/${courseId}`}>
          <Button variant="outline" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Course
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">Comprehensive course management</p>
        </div>
      </div>

      {/* Course Management Tabs */}
      <CourseDetailsTabs courseId={courseId} />
    </div>
  );
}
