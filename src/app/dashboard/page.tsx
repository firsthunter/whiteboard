import { RecentAssignments } from "@/components/dashboard/recent-assignments";
import { RecentCourses } from "@/components/dashboard/recent-courses";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Stats Overview */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="space-y-4 sm:space-y-6">
            <RecentCourses />
            <RecentAssignments />
          </div>
          <div>
            <UpcomingEvents />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
