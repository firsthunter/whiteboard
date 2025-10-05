"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddCircle, ArrowLeft2, ArrowRight2 } from "iconsax-react";

const events = [
  {
    date: 5,
    events: [{ title: "Math Exam", type: "exam", color: "bg-red-500" }],
  },
  {
    date: 8,
    events: [{ title: "Physics Lab", type: "lab", color: "bg-blue-500" }],
  },
  {
    date: 10,
    events: [{ title: "Team Meeting", type: "meeting", color: "bg-green-500" }],
  },
  {
    date: 12,
    events: [
      {
        title: "CS Presentation",
        type: "presentation",
        color: "bg-purple-500",
      },
    ],
  },
];

export default function CalendarPage() {
  const daysInMonth = 31;
  const firstDay = 0; // Sunday

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              View and manage your schedule
            </p>
          </div>
          <Button>
            <AddCircle size={18} className="mr-2 text-white" variant="Bold" />
            Add Event
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>October 2025</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <ArrowLeft2
                      size={16}
                      className="text-primary"
                      variant="Bold"
                    />
                  </Button>
                  <Button variant="outline" size="sm">
                    Today
                  </Button>
                  <Button variant="outline" size="icon">
                    <ArrowRight2
                      size={16}
                      className="text-primary"
                      variant="Bold"
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  )
                )}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Calendar days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = events.find((e) => e.date === day);
                  const isToday = day === 5;

                  return (
                    <div
                      key={day}
                      className={`
                        min-h-20 rounded-lg border p-2 transition-colors cursor-pointer
                        hover:bg-accent
                        ${isToday ? "border-primary bg-primary/5" : ""}
                      `}
                    >
                      <div
                        className={`
                          text-sm font-semibold mb-1
                          ${isToday ? "text-primary" : "text-foreground"}
                        `}
                      >
                        {day}
                      </div>
                      {dayEvents && (
                        <div className="space-y-1">
                          {dayEvents.events.map((event, idx) => (
                            <div
                              key={idx}
                              className={`${event.color} text-white text-xs p-1 rounded truncate`}
                            >
                              {event.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold">{event.date}</div>
                    <div className="text-xs text-muted-foreground">OCT</div>
                  </div>
                  <div className="flex-1">
                    {event.events.map((e, i) => (
                      <div key={i} className="space-y-1">
                        <h4 className="font-semibold text-sm">{e.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {e.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
