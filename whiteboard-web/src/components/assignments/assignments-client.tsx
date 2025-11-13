'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, CheckCircle2, Clock, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CreateAssignmentDialog } from './create-assignment-dialog';
import { EditAssignmentDialog } from './edit-assignment-dialog';
import { deleteAssignment, getAssignmentSubmission } from '@/actions/assignments';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  course: {
    id: string;
    title: string;
    code: string;
  };
  submissions?: any[];
  _count?: {
    submissions: number;
  };
}

interface AssignmentsClientProps {
  initialAssignments: Assignment[];
  userRole: string;
}

export function AssignmentsClient({ initialAssignments, userRole }: AssignmentsClientProps) {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userSubmissions, setUserSubmissions] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const isInstructor = userRole === 'INSTRUCTOR' || userRole === 'ADMIN';
  const isStudent = userRole === 'STUDENT';

  // Fetch user submissions for students
  useEffect(() => {
    if (isStudent && assignments.length > 0) {
      const fetchUserSubmissions = async () => {
        const submissions: Record<string, boolean> = {};
        
        for (const assignment of assignments) {
          try {
            const result = await getAssignmentSubmission(assignment.id);
            submissions[assignment.id] = result.success && !!result.data;
          } catch (error) {
            console.error(`Failed to fetch submission for assignment ${assignment.id}:`, error);
            submissions[assignment.id] = false;
          }
        }
        
        setUserSubmissions(submissions);
      };
      
      void fetchUserSubmissions();
    }
  }, [assignments, isStudent]);

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    setDeletingId(assignmentId);
    try {
      const result = await deleteAssignment(assignmentId);
      if (result.success) {
        setAssignments(assignments.filter(a => a.id !== assignmentId));
        toast.success('Assignment deleted successfully!');
      } else {
        toast.error(result.error?.message || 'Failed to delete assignment');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleAssignmentCreated = (newAssignment: Assignment) => {
    setAssignments([newAssignment, ...assignments]);
    setShowCreateDialog(false);
    router.refresh();
  };

  const handleAssignmentUpdated = (updatedAssignment: Assignment) => {
    setAssignments(assignments.map(a => a.id === updatedAssignment.id ? updatedAssignment : a));
    setEditingAssignment(null);
    router.refresh();
  };

  const getStatusBadge = (assignment: Assignment) => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    // For students, check if they have submitted
    // For instructors, check if any submissions exist
    const hasSubmission = isStudent 
      ? userSubmissions[assignment.id] || false
      : assignment.submissions && assignment.submissions.length > 0;

    if (hasSubmission) {
      return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Submitted</Badge>;
    }

    if (dueDate < now) {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
    }

    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 3) {
      return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
        <Clock className="h-3 w-3 mr-1" />Due Soon
      </Badge>;
    }

    return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Search and Create Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isInstructor && (
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Assignment
          </Button>
        )}
      </div>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                📝
              </div>
              <h3 className="text-lg font-semibold">
                {searchQuery ? 'No assignments found' : 'No assignments yet'}
              </h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : isInstructor
                  ? 'Get started by creating your first assignment'
                  : 'Check back later for new assignments'}
              </p>
              {isInstructor && !searchQuery && (
                <Button onClick={() => setShowCreateDialog(true)} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Assignment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-1 text-lg">{assignment.title}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <span className="font-medium text-primary">{assignment.course.code}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="truncate">{assignment.course.title}</span>
                      </CardDescription>
                    </div>
                    {!isInstructor && getStatusBadge(assignment)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {assignment.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {formatDate(assignment.dueDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Points:</span>
                      <Badge variant="secondary">{assignment.maxPoints}</Badge>
                    </div>
                    {isInstructor && assignment._count && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Submissions:</span>
                        <Badge variant="outline">{assignment._count.submissions}</Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      asChild 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                    >
                      <Link href={`/assignments/${assignment.id}`}>
                        View Details
                      </Link>
                    </Button>

                    {isInstructor && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAssignment(assignment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(assignment.id)}
                          disabled={deletingId === assignment.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {isInstructor && (
        <>
          <CreateAssignmentDialog
            open={showCreateDialog}
            onClose={() => setShowCreateDialog(false)}
            onAssignmentCreated={handleAssignmentCreated}
          />

          {editingAssignment && (
            <EditAssignmentDialog
              open={!!editingAssignment}
              assignment={editingAssignment}
              onClose={() => setEditingAssignment(null)}
              onAssignmentUpdated={handleAssignmentUpdated}
            />
          )}
        </>
      )}
    </div>
  );
}
