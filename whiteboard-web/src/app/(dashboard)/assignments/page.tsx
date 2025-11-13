import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/auth-options';
import { getAssignments } from '@/actions/assignments';
import { AssignmentsClient } from '@/components/assignments/assignments-client';

export default async function AssignmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-out');
  }

  const result = await getAssignments();
  console.log(result);
  
  const assignments = result.success ? result.data?.assignments || [] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground mt-2">
          {session.user.role === 'INSTRUCTOR' 
            ? 'Manage assignments for your courses' 
            : 'View and submit your assignments'}
        </p>
      </div>

      <AssignmentsClient 
        initialAssignments={assignments} 
        userRole={session.user.role}
      />
    </div>
  );
}
