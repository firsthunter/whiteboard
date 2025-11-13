'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, FileText } from 'lucide-react';
import { CreateAssignmentDialog } from './create-assignment-dialog';
import { EditAssignmentDialog } from './edit-assignment-dialog';
import { useState } from 'react';
import { format, isPast, isFuture } from 'date-fns';
import { deleteAssignment } from '@/actions/assignments';
import { toast } from 'sonner';
import Link from 'next/link';

interface CourseAssignmentsManagerProps {
  courseId: string;
  assignments: any[];
  onUpdate: () => void;
}

export function CourseAssignmentsManager({ 
  courseId, 
  assignments: initialAssignments, 
  onUpdate 
}: CourseAssignmentsManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      const result = await deleteAssignment(id);
      if (result.success) {
        toast.success('Assignment deleted successfully!');
        onUpdate();
      } else {
        toast.error(result.error?.message || 'Failed to delete assignment');
      }
    } catch {
      toast.error('An error occurred while deleting assignment');
    }
  };

  const getAssignmentStatus = (dueDate: string) => {
    const due = new Date(dueDate);
    if (isPast(due)) {
      return { label: 'Past Due', variant: 'destructive' as const };
    }
    if (isFuture(due)) {
      return { label: 'Upcoming', variant: 'default' as const };
    }
    return { label: 'Due Today', variant: 'secondary' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Assignments</h2>
          <p className="text-muted-foreground">Manage assignments for this course</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Assignment
        </Button>
      </div>

      {initialAssignments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first assignment to assess student learning
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {initialAssignments.map((assignment) => {
            const status = getAssignmentStatus(assignment.dueDate);
            return (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <Badge variant="outline" className="gap-1">
                          {assignment.maxPoints} points
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {assignment.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{assignment._count?.submissions || assignment.submissionCount || 0} submissions</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Link href={`/assignments/${assignment.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAssignment(assignment)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(assignment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <CreateAssignmentDialog
        courseId={courseId}
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false);
          onUpdate();
        }}
      />

      {/* Edit Dialog */}
      {editingAssignment && (
        <EditAssignmentDialog
          assignment={editingAssignment}
          open={!!editingAssignment}
          onClose={() => setEditingAssignment(null)}
          onUpdated={() => {
            setEditingAssignment(null);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}
