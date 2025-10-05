"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock } from "iconsax-react";

const upcomingEvents = [
  {
    id: 1,
    title: "Mathematics Exam",
    type: "Exam",
    date: "Tomorrow",
    time: "10:00 AM",
    color: "bg-red-500",
  },
  {
    id: 2,
    title: "Physics Lab Report Due",
    type: "Assignment",
    date: "Oct 8, 2025",
    time: "11:59 PM",
    color: "bg-blue-500",
  },
  {
    id: 3,
    title: "Team Meeting",
    type: "Meeting",
    date: "Oct 10, 2025",
    time: "3:00 PM",
    color: "bg-green-500",
  },
  {
    id: 4,
    title: "CS Project Presentation",
    type: "Presentation",
    date: "Oct 12, 2025",
    time: "2:00 PM",
    color: "bg-purple-500",
  },
];

export function UpcomingEvents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon size={20} variant="Bold" className="text-primary" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 rounded-lg border p-4 hover:bg-accent transition-colors"
          >
            <div className={`h-12 w-1 rounded-full ${event.color}`} />
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm">{event.title}</h4>
                  <p className="text-xs text-muted-foreground">{event.type}</p>
                </div>
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {event.date}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={14} className="text-orange-600" variant="Bold" />
                {event.time}
              </div>
            </div>
          </motion.div>
        ))}
        <Button variant="outline" className="w-full mt-4">
          View Full Calendar
        </Button>
      </CardContent>
    </Card>
  );
}
