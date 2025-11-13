import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/auth-options";
import { CalendarClient } from "@/components/calendar/calendar-client";
import { getEvents } from "@/actions/events";
import { getAssignments } from "@/actions/assignments";

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/signin");
  }

  // Get events for the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [eventsResult, assignmentsResult] = await Promise.all([
    getEvents(startOfMonth.toISOString(), endOfMonth.toISOString()),
    getAssignments(), // Get all assignments without courseId filter
  ]);

  const events = eventsResult.success && eventsResult.data ? eventsResult.data : [];
  const assignmentsData = assignmentsResult.success && assignmentsResult.data ? assignmentsResult.data : null;
  const assignments = assignmentsData?.assignments || [];

  return (
    <CalendarClient
      initialEvents={events}
      initialAssignments={assignments}
      userRole={session.user?.role || 'STUDENT'}
    />
  );
}
