"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Book1, Clock, People, Teacher } from "iconsax-react";

const courses = [
  {
    id: 1,
    name: "Advanced Mathematics",
    code: "MATH 301",
    instructor: "Dr. Sarah Johnson",
    students: 45,
    progress: 75,
    image: "🔢",
    color: "bg-gradient-to-br from-blue-500 to-cyan-500",
    schedule: "Mon, Wed, Fri - 10:00 AM",
    description: "Advanced calculus and linear algebra concepts",
  },
  {
    id: 2,
    name: "Physics Laboratory",
    code: "PHYS 201",
    instructor: "Prof. Michael Chen",
    students: 30,
    progress: 60,
    image: "⚛️",
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    schedule: "Tue, Thu - 2:00 PM",
    description: "Hands-on physics experiments and analysis",
  },
  {
    id: 3,
    name: "Computer Science 101",
    code: "CS 101",
    instructor: "Dr. Emily Brown",
    students: 60,
    progress: 85,
    image: "💻",
    color: "bg-gradient-to-br from-green-500 to-emerald-500",
    schedule: "Mon, Wed - 3:00 PM",
    description: "Introduction to programming and algorithms",
  },
  {
    id: 4,
    name: "Digital Marketing",
    code: "MKT 250",
    instructor: "Prof. David Lee",
    students: 38,
    progress: 45,
    image: "📱",
    color: "bg-gradient-to-br from-orange-500 to-yellow-500",
    schedule: "Tue, Thu - 11:00 AM",
    description: "Modern digital marketing strategies",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function CoursesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              My Courses
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage and track your enrolled courses
            </p>
          </div>
          <Button className="w-full sm:w-auto">
            <Book1 size={18} className="mr-2 text-white" variant="Bold" />
            Enroll New Course
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2"
            >
              {courses.map((course) => (
                <motion.div key={course.id} variants={item}>
                  <Card className="group relative overflow-hidden transition-all hover:shadow-2xl cursor-pointer border-2 hover:border-primary/20">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

                    <CardHeader className="relative">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl ${course.color} text-3xl sm:text-4xl shadow-lg flex-shrink-0`}
                        >
                          {course.image}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="mb-1 text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                                {course.name}
                              </CardTitle>
                              <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                                {course.code}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm flex-shrink-0"
                            >
                              {course.progress}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {course.description}
                      </p>

                      <Progress value={course.progress} className="h-2" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Teacher
                            size={16}
                            className="text-primary flex-shrink-0"
                            variant="Bold"
                          />
                          <span className="text-muted-foreground truncate">
                            {course.instructor}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <People
                            size={16}
                            className="text-green-600 flex-shrink-0"
                            variant="Bold"
                          />
                          <span className="text-muted-foreground">
                            {course.students} students
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm border-t pt-4">
                        <Clock
                          size={16}
                          className="text-orange-600 flex-shrink-0"
                          variant="Bold"
                        />
                        <span className="text-muted-foreground truncate">
                          {course.schedule}
                        </span>
                      </div>

                      <Button className="w-full" variant="outline">
                        View Course Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="in-progress">
            <p className="text-center text-muted-foreground py-8">
              Showing courses in progress...
            </p>
          </TabsContent>
          <TabsContent value="completed">
            <p className="text-center text-muted-foreground py-8">
              No completed courses yet.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
