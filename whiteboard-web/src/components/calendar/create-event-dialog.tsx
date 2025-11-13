'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { createEvent } from '@/actions/events';
import { EventType, Event } from '@/actions/utils/event-types';
import { toast } from 'sonner';

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  onEventCreated: (event: Event) => void;
}

export function CreateEventDialog({ open, onClose, onEventCreated }: CreateEventDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventType, setEventType] = useState<EventType>(EventType.OTHER);
  const [isAllDay, setIsAllDay] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    const startDate = formData.get('startDate') as string;
    const startTime = formData.get('startTime') as string;
    const endDate = formData.get('endDate') as string;
    const endTime = formData.get('endTime') as string;

    // Combine date and time for startDate
    const startDateTime = isAllDay 
      ? new Date(startDate).toISOString()
      : new Date(`${startDate}T${startTime}`).toISOString();

    // Combine date and time for endDate (if provided)
    let endDateTime: string | undefined;
    if (endDate) {
      endDateTime = isAllDay 
        ? new Date(endDate).toISOString()
        : endTime 
          ? new Date(`${endDate}T${endTime}`).toISOString()
          : new Date(endDate).toISOString();
    }

    const eventData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      type: eventType,
      startDate: startDateTime,
      endDate: endDateTime,
      location: formData.get('location') as string || undefined,
      isAllDay,
    };

    try {
      const result = await createEvent(eventData);
      
      if (result.success && result.data) {
        toast.success('Event created successfully!');
        onEventCreated(result.data);
        onClose();
      } else {
        toast.error(result.error?.message || 'Failed to create event');
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
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Add a new event to your calendar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter event title"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Event Type *</Label>
            <Select value={eventType} onValueChange={(value) => setEventType(value as EventType)} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EventType.CLASS}>Class</SelectItem>
                <SelectItem value={EventType.EXAM}>Exam</SelectItem>
                <SelectItem value={EventType.MEETING}>Meeting</SelectItem>
                <SelectItem value={EventType.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter event description"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                disabled={isSubmitting}
              />
            </div>

            {!isAllDay && (
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                disabled={isSubmitting}
              />
            </div>

            {!isAllDay && (
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="Enter event location"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAllDay"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isAllDay" className="cursor-pointer">
              All Day Event
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Event
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
