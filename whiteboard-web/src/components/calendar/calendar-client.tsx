'use client';

import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventType } from '@/actions/utils/event-types';

interface Event {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: EventType;
  startDate: string;
  endDate: string | null;
  location: string | null;
  courseId: string | null;
  isAllDay: boolean;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    code: string;
    title: string;
  };
}

interface CalendarClientProps {
  initialEvents: Event[];
}

const eventTypeColors = {
  [EventType.ASSIGNMENT]: "bg-red-500",
  [EventType.CLASS]: "bg-blue-500",
  [EventType.EXAM]: "bg-purple-500",
  [EventType.MEETING]: "bg-green-500",
  [EventType.OTHER]: "bg-gray-500",
};

export function CalendarClient({ initialEvents }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events] = useState(initialEvents);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const eventDate = new Date(event.startDate);
    const day = eventDate.getDate();
    
    // Only include events from the current month
    if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(event);
    }
    return acc;
  }, {} as Record<number, Event[]>);

  // Get upcoming events
  const upcomingEvents = events
    .filter(event => new Date(event.startDate) >= today)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage your schedule
          </p>
        </div>
        <Button>
          <span className="mr-2 text-lg">➕</span>
          Add Event
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{monthNames[month]} {year}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                  <span className="text-lg">⬅️</span>
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                  <span className="text-lg">➡️</span>
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

              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = eventsByDate[day] || [];
                const isToday = 
                  day === today.getDate() && 
                  month === today.getMonth() && 
                  year === today.getFullYear();

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
                    {dayEvents.length > 0 && (
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`${eventTypeColors[event.type]} text-white text-xs p-1 rounded truncate`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No upcoming events
              </p>
            ) : (
              upcomingEvents.map((event) => {
                const eventDate = new Date(event.startDate);
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="text-center min-w-[48px]">
                      <div className="text-2xl font-bold">{eventDate.getDate()}</div>
                      <div className="text-xs text-muted-foreground">
                        {monthNames[eventDate.getMonth()].slice(0, 3).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">{event.title}</h4>
                        {event.type === EventType.ASSIGNMENT && (
                          <Badge variant="destructive" className="text-xs">
                            Due
                          </Badge>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {event.type.toLowerCase()}
                        </Badge>
                        {event.course && (
                          <Badge variant="outline" className="text-xs">
                            {event.course.code} - {event.course.title}
                          </Badge>
                        )}
                        {event.type === EventType.ASSIGNMENT && (
                          <span className="text-xs text-muted-foreground">
                            📅 {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
