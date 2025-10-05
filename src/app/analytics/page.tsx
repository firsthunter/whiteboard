"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chart, TrendDown, TrendUp } from "iconsax-react";

const performanceData = [
  { subject: "Mathematics", grade: 92, trend: "up", change: "+5%" },
  { subject: "Physics", grade: 88, trend: "up", change: "+3%" },
  { subject: "Computer Science", grade: 95, trend: "up", change: "+2%" },
  { subject: "Digital Marketing", grade: 85, trend: "down", change: "-1%" },
];

const activityData = [
  { month: "Jun", hours: 20 },
  { month: "Jul", hours: 25 },
  { month: "Aug", hours: 22 },
  { month: "Sep", hours: 28 },
  { month: "Oct", hours: 24 },
];

export default function AnalyticsPage() {
  const maxHours = Math.max(...activityData.map((d) => d.hours));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your academic performance and progress
          </p>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-6 space-y-6">
            {/* Overall Stats */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overall GPA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3.85</div>
                  <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <TrendUp size={14} />
                    +0.12 from last semester
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Assignments Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">45/48</div>
                  <Progress value={93.75} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Attendance Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">96%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Excellent attendance
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Subject Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceData.map((item) => (
                  <div key={item.subject} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{item.subject}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {item.grade}%
                        </span>
                        <span
                          className={`flex items-center gap-1 text-xs ${
                            item.trend === "up"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {item.trend === "up" ? (
                            <TrendUp size={14} />
                          ) : (
                            <TrendDown size={14} />
                          )}
                          {item.change}
                        </span>
                      </div>
                    </div>
                    <Progress value={item.grade} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityData.map((data) => (
                    <div key={data.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{data.month}</span>
                        <span className="text-muted-foreground">
                          {data.hours}h
                        </span>
                      </div>
                      <div className="h-8 bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(data.hours / maxHours) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Chart size={20} variant="Bold" />
                  Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-semibold text-sm text-blue-500 mb-1">
                    Strong Performance
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your Computer Science grade is excellent. Keep up the great
                    work!
                  </p>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <h4 className="font-semibold text-sm text-yellow-500 mb-1">
                    Needs Attention
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Digital Marketing grade has decreased. Consider scheduling
                    office hours.
                  </p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="font-semibold text-sm text-green-500 mb-1">
                    Study Pattern
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your study hours are consistent. Try to maintain this
                    pattern!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
