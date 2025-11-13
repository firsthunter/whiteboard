'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Plus, Edit, Trash2, Pin, PinOff } from 'lucide-react';
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/actions/announcements';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface CourseAnnouncementsManagerProps {
  courseId: string;
  announcements: any[];
  onUpdate: () => void;
}

export function CourseAnnouncementsManager({ 
  courseId, 
  announcements: initialAnnouncements,
  onUpdate 
}: CourseAnnouncementsManagerProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      isPinned: false,
    });
    setEditingAnnouncement(null);
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createAnnouncement({
        courseId,
        title: formData.title,
        content: formData.content,
        isPinned: formData.isPinned,
      });

      if (result.success) {
        toast.success('Announcement created successfully!');
        setShowCreateDialog(false);
        resetForm();
        onUpdate();
      } else {
        toast.error(result.error?.message || 'Failed to create announcement');
      }
    } catch (error) {
      toast.error('An error occurred while creating announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingAnnouncement) return;

    setSubmitting(true);
    try {
      const result = await updateAnnouncement(editingAnnouncement.id, {
        title: formData.title,
        content: formData.content,
        isPinned: formData.isPinned,
      });

      if (result.success) {
        toast.success('Announcement updated successfully!');
        setEditingAnnouncement(null);
        resetForm();
        onUpdate();
      } else {
        toast.error(result.error?.message || 'Failed to update announcement');
      }
    } catch (error) {
      toast.error('An error occurred while updating announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const result = await deleteAnnouncement(id);
      if (result.success) {
        toast.success('Announcement deleted successfully!');
        onUpdate();
      } else {
        toast.error(result.error?.message || 'Failed to delete announcement');
      }
    } catch (error) {
      toast.error('An error occurred while deleting announcement');
    }
  };

  const handleTogglePin = async (announcement: any) => {
    try {
      const result = await updateAnnouncement(announcement.id, {
        isPinned: !announcement.isPinned,
      });

      if (result.success) {
        toast.success(announcement.isPinned ? 'Announcement unpinned' : 'Announcement pinned');
        onUpdate();
      } else {
        toast.error(result.error?.message || 'Failed to update announcement');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const openEditDialog = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      isPinned: announcement.isPinned,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Announcements</h2>
          <p className="text-muted-foreground">Manage announcements for this course</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
              <DialogDescription>
                Create a new announcement to share important information with course participants.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter announcement content"
                  rows={6}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isPinned">Pin this announcement</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Announcement'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Megaphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first announcement to communicate with students
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Announcement
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{announcement.title}</CardTitle>
                      {announcement.isPinned && (
                        <Badge variant="secondary" className="gap-1">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePin(announcement)}
                    >
                      {announcement.isPinned ? (
                        <PinOff className="h-4 w-4" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingAnnouncement} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>
              Update the announcement details and content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isPinned"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="edit-isPinned">Pin this announcement</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Announcement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
