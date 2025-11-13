import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/auth-options';
import { getAssignmentById } from '@/actions/assignments';
import { AssignmentDetailClient } from '@/components/assignments/assignment-detail-client';

interface AssignmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-out');
  }

  const { id } = await params;
  const result = await getAssignmentById(id);

  if (!result.success || !result.data) {
    return redirect('/assignments');
  }

  const assignment = result.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{assignment.title}</h1>
        <p className="text-muted-foreground mt-2">
          {assignment.course.title} • {assignment.course.code}
        </p>
      </div>

      <AssignmentDetailClient
        assignment={assignment}
        userRole={session.user.role}
        userId={session.user.id}
      />
    </div>
  );
}