"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Calendar, Award } from "lucide-react";
import { MarkdownViewer } from "@/components/markdown-editor";
import { format } from "date-fns";
import { toast } from "sonner";
import { gradeSubmission } from "@/actions/assignments";

interface Submission {
  id: string;
  submittedAt: string;
  content?: string;
  grade?: number | null;
  feedback?: string | null;
  userId: string;
  student?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  user?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface GradeSubmissionDialogProps {
  open: boolean;
  submission: Submission | null;
  maxPoints: number;
  onClose: () => void;
  onGraded: () => void;
}

export function GradeSubmissionDialog({
  open,
  submission,
  maxPoints,
  onClose,
  onGraded,
}: GradeSubmissionDialogProps) {
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when submission changes
  useState(() => {
    if (submission) {
      setGrade(submission.grade?.toString() || "");
      setFeedback(submission.feedback || "");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;

    const gradeNum = parseInt(grade);
    
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > maxPoints) {
      toast.error(`Grade must be between 0 and ${maxPoints}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await gradeSubmission(submission.id, {
        grade: gradeNum,
        feedback: feedback.trim() || undefined,
      });

      if (result.success) {
        toast.success("Submission graded successfully!", {
          description: `Grade: ${gradeNum}/${maxPoints}`,
        });
        onGraded();
        onClose();
      } else {
        toast.error(result.error?.message || "Failed to grade submission");
      }
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error("Failed to grade submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!submission) return null;

  const student = submission.student || submission.user;
  const studentName = student ? `${student.firstName} ${student.lastName}` : "Unknown Student";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl">Grade Submission</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Student Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Student</p>
                    <p className="text-sm text-muted-foreground">{studentName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(submission.submittedAt), "PPp")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Current Grade</p>
                    <div className="text-sm text-muted-foreground">
                      {submission.grade !== null && submission.grade !== undefined ? (
                        <Badge variant="secondary">
                          {submission.grade}/{maxPoints}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Graded</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Content */}
          {submission.content && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Submission Content</Label>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:border">
                    <MarkdownViewer content={submission.content} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grading Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="grade" className="text-base font-semibold">
                Grade (out of {maxPoints}) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="grade"
                type="number"
                min={0}
                max={maxPoints}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder={`Enter grade (0-${maxPoints})`}
                required
                disabled={isSubmitting}
                className="text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="feedback" className="text-base font-semibold">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback for the student..."
                className="min-h-[120px] text-base resize-none"
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground">
                This feedback will be sent to the student via email and in-app notification.
              </p>
            </div>
          </form>
        </div>

        <DialogFooter className="shrink-0 border-t pt-4 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Grading...
              </>
            ) : (
              "Submit Grade"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
