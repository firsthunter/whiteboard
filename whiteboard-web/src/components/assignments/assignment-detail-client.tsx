'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Award, FileText, Users, CheckCircle2, AlertCircle, Edit, Trash2, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { SubmissionForm } from './submission-form';
import { EditAssignmentDialog } from './edit-assignment-dialog';
import { GradeSubmissionDialog } from './grade-submission-dialog';
import { deleteAssignment } from '@/actions/assignments';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MarkdownViewer } from '@/components/markdown-editor';

interface Submission {
  id: string;
  submittedAt: string;
  content?: string;
  grade?: number;
  feedback?: string;
  userId: string;
  student?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  maxPoints: number;
  course: {
    id: string;
    title: string;
    code: string;
  };
  submissions?: Submission[];
  _count?: {
    submissions: number;
  };
}

interface AssignmentDetailClientProps {
  assignment: Assignment;
  userRole: string;
  userId: string;
}

export function AssignmentDetailClient({ assignment, userRole, userId }: AssignmentDetailClientProps) {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const isInstructor = userRole === 'INSTRUCTOR' || userRole === 'ADMIN';
  const isStudent = userRole === 'STUDENT';

  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isOverdue = dueDate < now;

  const userSubmission = assignment.submissions?.find(sub => (sub as any).userId === userId);
  
  // Optimistic submission state - tracks if user has submitted (including optimistic updates)
  const [hasSubmitted, setHasSubmitted] = useState(!!userSubmission);
  const [optimisticSubmissionDate, setOptimisticSubmissionDate] = useState<Date | null>(
    userSubmission ? new Date(userSubmission.submittedAt) : null
  );

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const result = await deleteAssignment(assignment.id);
      if (result.success) {
        toast.success('Assignment deleted successfully!');
        router.push('/assignments');
      } else {
        toast.error(result.error?.message || 'Failed to delete assignment');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleAssignmentUpdated = () => {
    setShowEditDialog(false);
    router.refresh();
  };

  const handleSubmissionSuccess = () => {
    // Optimistically update UI
    setHasSubmitted(true);
    setOptimisticSubmissionDate(new Date());
    setShowSubmissionForm(false);
    console.log('✅ Assignment submission saved to database');
  };

  const handleSubmissionError = () => {
    // Rollback optimistic update on error
    setHasSubmitted(!!userSubmission);
    setOptimisticSubmissionDate(userSubmission ? new Date(userSubmission.submittedAt) : null);
  };

  return (
    <div className="space-y-6">
      {/* Assignment Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={isOverdue ? "destructive" : hasSubmitted ? "default" : "secondary"}>
                  {hasSubmitted ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Submitted
                    </>
                  ) : isOverdue ? (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Overdue
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
                <Badge variant="outline">
                  <Award className="h-3 w-3 mr-1" />
                  {assignment.maxPoints} points
                </Badge>
              </div>
            </div>

            {isInstructor && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Due Date and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Due Date</p>
                <p className={`text-sm ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {format(dueDate, 'PPP p')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Points</p>
                <p className="text-sm text-muted-foreground">{assignment.maxPoints} points</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Submissions</p>
                <p className="text-sm text-muted-foreground">
                  {assignment._count?.submissions || 0} submitted
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Description
            </h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {assignment.description}
              </p>
            </div>
          </div>

          {/* Instructions */}
          {assignment.instructions && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {assignment.instructions}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Student Actions */}
          {isStudent && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Submission</h3>

                {hasSubmitted ? (
                  <div className="space-y-4">
                    <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                          <div>
                            <p className="font-medium text-green-900 dark:text-green-100">Assignment Submitted ✓</p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              {optimisticSubmissionDate ? (
                                `Submitted on ${format(optimisticSubmissionDate, 'PPP p')}`
                              ) : (
                                'Submission recorded'
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Show submission content if available */}
                        {userSubmission?.content && (
                          <div className="pt-4 border-t border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">Your Submission:</p>
                            <div className="p-4 bg-white dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                              <MarkdownViewer content={userSubmission.content} />
                            </div>
                          </div>
                        )}

                        {/* Show grade if available */}
                        {userSubmission?.grade !== null && userSubmission?.grade !== undefined && (
                          <div className="pt-4 border-t border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-green-900 dark:text-green-100">Grade:</p>
                              <Badge variant="secondary" className="text-base">
                                {userSubmission.grade}/{assignment.maxPoints} points
                              </Badge>
                            </div>
                            {userSubmission.feedback && (
                              <div className="mt-2 p-3 bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Instructor Feedback:</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{userSubmission.feedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Info message about re-submission */}
                    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              Submission Complete
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                              You have already submitted this assignment. Re-submissions are not allowed. 
                              If you need to make changes, please contact your instructor.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button
                      onClick={() => setShowSubmissionForm(true)}
                      className="w-full sm:w-auto"
                    >
                      {isOverdue ? 'Submit Late' : 'Submit Assignment'}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Instructor View - Submissions */}
          {isInstructor && assignment.submissions && assignment.submissions.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Student Submissions ({assignment.submissions.length})
                </h3>
                <div className="space-y-3">
                  {assignment.submissions.map((submission: Submission) => (
                    <Card key={submission.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium">
                            {submission.student?.name ||
                             (submission.user ? `${submission.user.firstName} ${submission.user.lastName}` : 'Unknown Student')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted {format(new Date(submission.submittedAt), 'PPp')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={submission.grade !== null && submission.grade !== undefined ? "default" : "outline"}>
                            {submission.grade !== null && submission.grade !== undefined 
                              ? `${submission.grade}/${assignment.maxPoints}` 
                              : 'Not Graded'}
                          </Badge>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setShowGradeDialog(true);
                            }}
                          >
                            {submission.grade !== null && submission.grade !== undefined ? 'Update Grade' : 'Grade'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Submission Form Modal */}
      {showSubmissionForm && (
        <SubmissionForm
          assignmentId={assignment.id}
          isOverdue={isOverdue}
          onSubmissionSuccess={handleSubmissionSuccess}
          onSubmissionError={handleSubmissionError}
        />
      )}

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditAssignmentDialog
          open={showEditDialog}
          assignment={assignment}
          onClose={() => setShowEditDialog(false)}
          onAssignmentUpdated={handleAssignmentUpdated}
        />
      )}

      {/* Grade Submission Dialog */}
      {showGradeDialog && selectedSubmission && (
        <GradeSubmissionDialog
          open={showGradeDialog}
          submission={selectedSubmission}
          maxPoints={assignment.maxPoints}
          onClose={() => {
            setShowGradeDialog(false);
            setSelectedSubmission(null);
          }}
          onGraded={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}