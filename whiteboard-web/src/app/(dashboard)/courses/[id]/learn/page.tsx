import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { redirect } from 'next/navigation';
import { getCourseById, getMyEnrollments, enrollInCourse } from '@/actions/courses';
import { getCourseModules } from '@/actions/modules';
import { CourseModuleResponse } from '@/actions/utils/types';
import { CourseLearningClient } from '@/components/courses/course-learning-client';

export default async function CourseLearningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-out');
  }

  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  // Step 1: Fetch course and enrollments first
  const [courseResult, enrollmentsResult] = await Promise.all([
    getCourseById(courseId),
    getMyEnrollments(),
  ]);

  if (!courseResult.success || !courseResult.data) {
    return redirect('/courses')
  }

  const course = courseResult.data;
  const enrollments = enrollmentsResult.success ? enrollmentsResult.data || [] : [];

  const isInstructor = course.instructor?.id === session.user?.id;
  let isEnrolled = enrollments.some(e => e.courseId === course.id);

  // Step 2: Auto-enroll students when they first access the learning page
  if (!isEnrolled && !isInstructor && session.user?.role === 'STUDENT') {
    const enrollResult = await enrollInCourse(course.id);
    if (enrollResult.success) {
      isEnrolled = true;
      console.log(`✅ Auto-enrolled student ${session.user.name} in course ${course.title} via learning page`);
    }
  }

  // Step 3: Now fetch modules (after enrollment is confirmed)
  const modulesResult = await getCourseModules(courseId);
  const modules: CourseModuleResponse[] = modulesResult.success ? modulesResult.data || [] : [];

  return (
    <CourseLearningClient 
      courseId={courseId}
      course={course}
      initialModules={modules}
      userId={session.user?.id || ''}
    />
  );
}
