"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Call, Message, SearchNormal1 } from "iconsax-react";

const students = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.j@example.com",
    course: "Computer Science",
    grade: "A",
    status: "active",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob.s@example.com",
    course: "Mathematics",
    grade: "B+",
    status: "active",
  },
  {
    id: 3,
    name: "Carol Williams",
    email: "carol.w@example.com",
    course: "Physics",
    grade: "A-",
    status: "active",
  },
  {
    id: 4,
    name: "David Brown",
    email: "david.b@example.com",
    course: "Digital Marketing",
    grade: "B",
    status: "inactive",
  },
];

export default function StudentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              Manage and connect with your classmates
            </p>
          </div>
          <Button>Add Student</Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Students</CardTitle>
              <div className="relative w-64">
                <SearchNormal1
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  type="search"
                  placeholder="Search students..."
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {student.course}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Grade: {student.grade}
                        </Badge>
                        <Badge
                          variant={
                            student.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {student.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Message size={18} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Call size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
