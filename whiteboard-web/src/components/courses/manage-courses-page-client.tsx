'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ManageCoursesClient } from "./manage-courses-client";
import { CreateCourseDialog } from "./create-course-dialog";
import { Course } from "@/actions/utils/types";

interface ManageCoursesPageClientProps {
  initialCourses: Course[];
}

export function ManageCoursesPageClient({ initialCourses }: ManageCoursesPageClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCourseCreated = (newCourse: Course) => {
    setCourses([newCourse, ...courses]);
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
          <p className="text-muted-foreground">
            Manage your courses, modules, assignments, and students
          </p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      <ManageCoursesClient initialCourses={courses} />

      <CreateCourseDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCourseCreated={handleCourseCreated}
      />
    </div>
  );
}
