'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Search, Mail, GraduationCap, Loader2 } from 'lucide-react';
import { getEnrolledStudents } from '@/actions/courses';

interface Student {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  image?: string;
  enrolledAt: string;
  progress?: number;
  grade?: number;
}

interface EnrolledStudentsProps {
  courseId: string;
  courseTitle?: string;
}

export function EnrolledStudents({ courseId, courseTitle }: EnrolledStudentsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const result = await getEnrolledStudents(courseId);

        if (result.success && result.data) {
          setStudents(result.data.students || []);
          setFilteredStudents(result.data.students || []);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStudents();
  }, [courseId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(
      (student) =>
        (student.firstName?.toLowerCase() || '').includes(query) ||
        (student.lastName?.toLowerCase() || '').includes(query) ||
        student.email.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Enrolled Students</h2>
            {courseTitle && (
              <p className="text-sm text-muted-foreground">{courseTitle}</p>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {students.length} {students.length === 1 ? 'Student' : 'Students'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
          <CardDescription>Find students by name or email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No students found' : 'No students enrolled yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Students will appear here once they enroll in the course'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {searchQuery
                ? `${filteredStudents.length} of ${students.length} students`
                : 'All Students'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.image} />
                        <AvatarFallback>
                          {(student.firstName?.[0] || '?').toUpperCase()}
                          {(student.lastName?.[0] || '').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {student.name || `${student.firstName || 'Unknown'} ${student.lastName || 'Student'}`}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {student.progress !== undefined && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Progress</p>
                          <p className="text-lg font-semibold">{student.progress}%</p>
                        </div>
                      )}
                      {student.grade !== undefined && student.grade > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Grade</p>
                          <Badge variant="secondary" className="text-base">
                            {student.grade}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
