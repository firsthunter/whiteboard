'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2 } from 'lucide-react';
import { createCourse } from '@/actions/courses';
import { Course } from '@/actions/utils/types';
import { toast } from 'sonner';

interface CreateCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onCourseCreated: (course: Course) => void;
}

export function CreateCourseDialog({ open, onClose, onCourseCreated }: CreateCourseDialogProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    const courseData = {
      code: formData.get('code') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      instructorId: session?.user?.id as string,
      maxEnrollment: parseInt(formData.get('maxEnrollment') as string) || 50,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    try {
      const result = await createCourse(courseData);
      
      if (result.success && result.data) {
        toast.success('Course created successfully!');
        onCourseCreated(result.data);
        onClose();
      } else {
        toast.error(result.error?.message || 'Failed to create course');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Fill in the course details to create a new course offering.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Course Code *</Label>
              <Input
                id="code"
                name="code"
                placeholder="CS101"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxEnrollment">Max Enrollment</Label>
              <Input
                id="maxEnrollment"
                name="maxEnrollment"
                type="number"
                placeholder="50"
                defaultValue="50"
                min="1"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Introduction to Computer Science"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter course description..."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder="Pick start date"
                disabled={isSubmitting}
                disabledDates={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                placeholder="Pick end date"
                disabled={isSubmitting}
                disabledDates={(date) =>
                  startDate
                    ? date < startDate
                    : date < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Course...
                </>
              ) : (
                'Create Course'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
