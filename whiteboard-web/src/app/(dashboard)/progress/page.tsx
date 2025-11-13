import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/auth-options';
import { getMyEnrollments, getCourseStatistics, checkCertificateEligibility } from '@/actions/courses';
import { getAssignments } from '@/actions/assignments';
import { ProgressClient } from '@/components/progress/progress-client';

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-out');
  }

  // Fetch all progress data
  const [enrollmentsResult, assignmentsResult] = await Promise.all([
    getMyEnrollments(),
    getAssignments(),
  ]);

  const enrollments = enrollmentsResult.success ? enrollmentsResult.data || [] : [];
  const assignments = assignmentsResult.success ? assignmentsResult.data?.assignments || [] : [];

  // Fetch statistics and certificate eligibility for each enrolled course
  const courseData = await Promise.all(
    enrollments.map(async (enrollment) => {
      const [statsResult, certResult] = await Promise.all([
        getCourseStatistics(enrollment.courseId),
        checkCertificateEligibility(enrollment.courseId),
      ]);

      return {
        enrollment,
        statistics: statsResult.success ? statsResult.data : null,
        certificateEligibility: certResult.success ? certResult.data : null,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Progress</h1>
        <p className="text-muted-foreground mt-2">
          Track your learning progress and achievements
        </p>
      </div>

      <ProgressClient 
        courseData={courseData}
        assignments={assignments}
      />
    </div>
  );
}
