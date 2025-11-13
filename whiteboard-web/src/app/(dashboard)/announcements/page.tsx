import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/auth-options';
import { getAnnouncements } from '@/actions/announcements';
import { AnnouncementsClient } from '@/components/announcements/announcements-client';

export default async function AnnouncementsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-out');
  }

  const result = await getAnnouncements();
  const announcements = result.success ? result.data || [] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground mt-2">
          {session.user.role === 'INSTRUCTOR' 
            ? 'Manage course announcements' 
            : 'Stay updated with course announcements'}
        </p>
      </div>

      <AnnouncementsClient 
        initialAnnouncements={announcements} 
        userRole={session.user.role}
      />
    </div>
  );
}
