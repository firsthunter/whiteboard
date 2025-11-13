'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnrolledStudents } from '@/components/students/enrolled-students';
import { GraduationCap } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  title: string;
  enrollmentCount: number;
}

interface MyStudentsClientProps {
  instructorCourses: Course[];
}

export function MyStudentsClient({ instructorCourses }: MyStudentsClientProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(
    instructorCourses.length > 0 ? instructorCourses[0].id : ''
  );

  if (instructorCourses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground">
              Create a course to start managing students
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedCourseId} onValueChange={setSelectedCourseId}>
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(instructorCourses.length, 4)}, 1fr)` }}>
          {instructorCourses.slice(0, 4).map((course) => (
            <TabsTrigger key={course.id} value={course.id}>
              {course.code}
            </TabsTrigger>
          ))}
        </TabsList>

        {instructorCourses.map((course) => (
          <TabsContent key={course.id} value={course.id}>
            <EnrolledStudents courseId={course.id} courseTitle={course.title} />
          </TabsContent>
        ))}
      </Tabs>

      {instructorCourses.length > 4 && (
        <Card>
          <CardHeader>
            <CardTitle>More Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {instructorCourses.slice(4).map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    selectedCourseId === course.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="font-semibold">{course.code}</div>
                  <div className="text-sm opacity-80">{course.title}</div>
                  <div className="text-xs opacity-60 mt-1">
                    {course.enrollmentCount} {course.enrollmentCount === 1 ? 'student' : 'students'}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
