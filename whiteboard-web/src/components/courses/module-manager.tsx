'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthAwareAction } from '@/hooks/use-auth-aware-action';
import {
  getCourseModules,
  createModule,
  updateModule,
  deleteModule,
  createResource,
  updateResource,
  deleteResource,
} from '@/actions/modules';
import type {
  CourseModuleResponse,
  ModuleResource,
  CreateModuleDto,
  UpdateModuleDto,
  CreateResourceDto,
  UpdateResourceDto,
  ResourceType,
} from '@/actions/utils/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Video,
  FileText,
  Link as LinkIcon,
  FileQuestion,
} from 'lucide-react';

interface ModuleManagerProps {
  courseId: string;
}

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  VIDEO: <Video className="h-4 w-4" />,
  DOCUMENT: <FileText className="h-4 w-4" />,
  READING: <BookOpen className="h-4 w-4" />,
  LINK: <LinkIcon className="h-4 w-4" />,
  QUIZ: <FileQuestion className="h-4 w-4" />,
};

const RESOURCE_TYPE_OPTIONS = [
  { value: 'VIDEO', label: 'Video' },
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'READING', label: 'Reading Material' },
  { value: 'LINK', label: 'External Link' },
  { value: 'QUIZ', label: 'Quiz' },
];

export function ModuleManager({ courseId }: ModuleManagerProps) {
  const [modules, setModules] = useState<CourseModuleResponse[]>([]);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModuleResponse | null>(null);
  const [isCreateResourceOpen, setIsCreateResourceOpen] = useState(false);
  const [resourceModuleId, setResourceModuleId] = useState<string | null>(null);
  const [editingResource, setEditingResource] = useState<{ moduleId: string; resource: ModuleResource } | null>(null);
  const [selectedResourceType, setSelectedResourceType] = useState<string>('VIDEO');

  const executeAction = useAuthAwareAction();

  const loadModules = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getCourseModules(courseId);
      if (result.success && result.data) {
        setModules(result.data);
      } else {
        toast.error(result.error?.message || 'Failed to load modules');
      }
    } catch (error: unknown) {
      console.error('Error loading modules:', error);
      toast.error('Error loading modules');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadModules();
  }, [loadModules]);

  const handleCreateModule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isPublished = formData.get('isPublished') === 'on';

    if (!title.trim()) {
      toast.error('Please enter a module title');
      return;
    }

    try {
      const result = await executeAction(createModule, courseId, {
        title,
        description: description || undefined,
        // order will be auto-calculated by backend
        isPublished,
      } as CreateModuleDto);

      if (result.success) {
        toast.success('Module created successfully');
        setIsCreateModuleOpen(false);
        await loadModules();
      } else {
        toast.error(result.error?.message || 'Failed to create module');
      }
    } catch (error: unknown) {
      console.error('Error creating module:', error);
      toast.error('Error creating module');
    }
  };

  const handleUpdateModule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingModule) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isPublished = formData.get('isPublished') === 'on';

    if (!title.trim()) {
      toast.error('Please enter a module title');
      return;
    }

    try {
      const result = await executeAction(updateModule, editingModule.id, {
        title,
        description: description || undefined,
        isPublished,
      } as UpdateModuleDto);

      if (result.success) {
        toast.success('Module updated successfully');
        setEditingModule(null);
        await loadModules();
      } else {
        toast.error(result.error?.message || 'Failed to update module');
      }
    } catch (error: unknown) {
      console.error('Error updating module:', error);
      toast.error('Error updating module');
    }
  };

  const handleDeleteModule = async (moduleId: string, moduleTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${moduleTitle}"?`)) return;

    try {
      const result = await deleteModule(moduleId);
      if (result.success) {
        toast.success('Module deleted successfully');
        await loadModules();
      } else {
        toast.error(result.error?.message || 'Failed to delete module');
      }
    } catch (error: unknown) {
      console.error('Error deleting module:', error);
      toast.error('Error deleting module');
    }
  };

  const handleCreateResource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resourceModuleId) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as ResourceType;
    const url = formData.get('url') as string;
    const content = formData.get('content') as string;
    const duration = formData.get('duration') as string;

    if (!title.trim()) {
      toast.error('Please enter a resource title');
      return;
    }

    try {
      const result = await executeAction(createResource, resourceModuleId, {
        title,
        description: description || undefined,
        type,
        url: url || undefined,
        content: content || url || undefined,
        duration: duration ? parseInt(duration) : undefined,
        // order will be auto-calculated by backend
      } as CreateResourceDto);

      if (result.success) {
        toast.success('Resource created successfully');
        setIsCreateResourceOpen(false);
        setResourceModuleId(null);
        await loadModules();
      } else {
        toast.error(result.error?.message || 'Failed to create resource');
      }
    } catch (error: unknown) {
      console.error('Error creating resource:', error);
      toast.error('Error creating resource');
    }
  };

  const handleUpdateResource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingResource) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as ResourceType;
    const url = formData.get('url') as string;
    const content = formData.get('content') as string;
    const duration = formData.get('duration') as string;

    if (!title.trim()) {
      toast.error('Please enter a resource title');
      return;
    }

    try {
      const result = await executeAction(updateResource, editingResource.resource.id, {
        title,
        description: description || undefined,
        type,
        url: url || undefined,
        content: content || url || undefined,
        duration: duration ? parseInt(duration) : undefined,
      } as UpdateResourceDto);

      if (result.success) {
        toast.success('Resource updated successfully');
        setEditingResource(null);
        await loadModules();
      } else {
        toast.error(result.error?.message || 'Failed to update resource');
      }
    } catch (error: unknown) {
      console.error('Error updating resource:', error);
      toast.error('Error updating resource');
    }
  };

  const handleDeleteResource = async (resourceId: string, resourceTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${resourceTitle}"?`)) return;

    try {
      const result = await deleteResource(resourceId);
      if (result.success) {
        toast.success('Resource deleted successfully');
        await loadModules();
      } else {
        toast.error(result.error?.message || 'Failed to delete resource');
      }
    } catch (error: unknown) {
      console.error('Error deleting resource:', error);
      toast.error('Error deleting resource');
    }
  };

  if (isLoading && modules.length === 0) {
    return <div className="text-center py-8">Loading modules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Content</h2>
          <p className="text-muted-foreground">Manage modules and learning resources</p>
        </div>
        <Button onClick={() => setIsCreateModuleOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Module
        </Button>
      </div>

      <div className="space-y-3">
        {modules.length === 0 ? (
          <Card className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No modules yet. Create one to get started.</p>
          </Card>
        ) : (
          modules.map((module) => (
            <Card key={module.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={() => setExpandedModuleId(expandedModuleId === module.id ? null : module.id)}
                        className="p-0 h-auto hover:opacity-70 transition-opacity"
                      >
                        {expandedModuleId === module.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <h3 className="font-semibold">{module.title}</h3>
                      <Badge variant={module.isPublished ? 'default' : 'secondary'}>
                        {module.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge variant="outline">{module.resources?.length || 0} resources</Badge>
                    </div>
                    {module.description && <p className="text-sm text-muted-foreground ml-6">{module.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingModule(module)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteModule(module.id, module.title)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expandedModuleId === module.id && (
                  <div className="ml-6 pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Resources</p>
                      <Button variant="outline" size="sm" onClick={() => { setResourceModuleId(module.id); setIsCreateResourceOpen(true); }}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Resource
                      </Button>
                    </div>

                    {module.resources && module.resources.length > 0 ? (
                      <div className="space-y-2">
                        {module.resources.map((resource) => (
                          <div key={resource.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                            <div className="flex items-center gap-2 flex-1">
                              {RESOURCE_ICONS[resource.type]}
                              <div className="flex-1">
                                <p className="text-sm font-medium">{resource.title}</p>
                                {resource.description && <p className="text-xs text-muted-foreground">{resource.description}</p>}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                                  {resource.duration && <Badge variant="outline" className="text-xs">{resource.duration} min</Badge>}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingResource({ moduleId: module.id, resource })}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteResource(resource.id, resource.title)} className="text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">No resources yet</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isCreateModuleOpen} onOpenChange={setIsCreateModuleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Module</DialogTitle>
            <DialogDescription>Add a new module to organize your course content.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateModule} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input name="title" placeholder="Module title" required className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea name="description" placeholder="Module description (optional)" className="mt-1" rows={3} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox name="isPublished" id="module-published" />
              <Label htmlFor="module-published">Publish this module</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsCreateModuleOpen(false)}>Cancel</Button>
              <Button type="submit">Create Module</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>Update module information.</DialogDescription>
          </DialogHeader>
          {editingModule && (
            <form onSubmit={handleUpdateModule} className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input name="title" defaultValue={editingModule.title} placeholder="Module title" required className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea name="description" defaultValue={editingModule.description || ''} placeholder="Module description (optional)" className="mt-1" rows={3} />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox name="isPublished" id="edit-module-published" defaultChecked={editingModule.isPublished} />
                <Label htmlFor="edit-module-published">Publish this module</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditingModule(null)}>Cancel</Button>
                <Button type="submit">Update Module</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateResourceOpen} onOpenChange={(open) => {
        setIsCreateResourceOpen(open);
        if (!open) {
          setResourceModuleId(null);
          setSelectedResourceType('VIDEO');
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
            <DialogDescription>Add a new learning resource to this module.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateResource} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input name="title" placeholder="Resource title" required className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea name="description" placeholder="Brief description" className="mt-1" rows={2} />
            </div>
            <div>
              <Label>Type *</Label>
              <Select 
                name="type" 
                required 
                value={selectedResourceType}
                onValueChange={setSelectedResourceType}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic fields based on type */}
            {selectedResourceType === 'VIDEO' && (
              <div>
                <Label>YouTube Video URL *</Label>
                <Input 
                  name="url" 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  className="mt-1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste the full YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                </p>
              </div>
            )}

            {selectedResourceType === 'DOCUMENT' && (
              <div>
                <Label>Document URL *</Label>
                <Input 
                  name="url" 
                  placeholder="https://example.com/document.pdf" 
                  className="mt-1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL to PDF, PowerPoint, or document file
                </p>
              </div>
            )}

            {selectedResourceType === 'LINK' && (
              <div>
                <Label>External Link URL *</Label>
                <Input 
                  name="url" 
                  placeholder="https://example.com" 
                  className="mt-1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Link to external resource or website
                </p>
              </div>
            )}

            {selectedResourceType === 'READING' && (
              <>
                <div>
                  <Label>URL (optional)</Label>
                  <Input 
                    name="url" 
                    placeholder="https://..." 
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional link to external resource
                  </p>
                </div>
                <div>
                  <Label>Content *</Label>
                  <Textarea 
                    name="content" 
                    placeholder="Enter the reading material text..."
                    className="mt-1" 
                    rows={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Full text content for students to read
                  </p>
                </div>
              </>
            )}

            {selectedResourceType === 'QUIZ' && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  ℹ️ Quiz Builder
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  After creating this quiz resource, you&apos;ll be able to add questions with multiple choice options, mark correct answers, and set point values.
                </p>
              </div>
            )}

            <div>
              <Label>Duration (minutes)</Label>
              <Input name="duration" type="number" min="0" placeholder="Estimated duration" className="mt-1" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => { 
                setIsCreateResourceOpen(false); 
                setResourceModuleId(null);
                setSelectedResourceType('VIDEO');
              }}>Cancel</Button>
              <Button type="submit">Add Resource</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingResource} onOpenChange={() => setEditingResource(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>Update resource information.</DialogDescription>
          </DialogHeader>
          {editingResource && (
            <form onSubmit={handleUpdateResource} className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input name="title" defaultValue={editingResource.resource.title} placeholder="Resource title" required className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea name="description" defaultValue={editingResource.resource.description || ''} placeholder="Brief description" className="mt-1" rows={2} />
              </div>
              <div>
                <Label>Type *</Label>
                <Select name="type" defaultValue={editingResource.resource.type} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic fields based on type */}
              {editingResource.resource.type === 'VIDEO' && (
                <div>
                  <Label>YouTube Video URL *</Label>
                  <Input 
                    name="url" 
                    defaultValue={editingResource.resource.url || editingResource.resource.content || ''}
                    placeholder="https://www.youtube.com/watch?v=..." 
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste the full YouTube URL
                  </p>
                </div>
              )}

              {editingResource.resource.type === 'DOCUMENT' && (
                <div>
                  <Label>Document URL *</Label>
                  <Input 
                    name="url" 
                    defaultValue={editingResource.resource.url || editingResource.resource.content || ''}
                    placeholder="https://example.com/document.pdf" 
                    className="mt-1"
                    required
                  />
                </div>
              )}

              {editingResource.resource.type === 'LINK' && (
                <div>
                  <Label>External Link URL *</Label>
                  <Input 
                    name="url" 
                    defaultValue={editingResource.resource.url || editingResource.resource.content || ''}
                    placeholder="https://example.com" 
                    className="mt-1"
                    required
                  />
                </div>
              )}

              {editingResource.resource.type === 'READING' && (
                <>
                  <div>
                    <Label>URL (optional)</Label>
                    <Input 
                      name="url" 
                      defaultValue={editingResource.resource.url || ''}
                      placeholder="https://..." 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Content *</Label>
                    <Textarea 
                      name="content" 
                      defaultValue={editingResource.resource.content || ''}
                      placeholder="Enter the reading material text..."
                      className="mt-1" 
                      rows={8}
                      required
                    />
                  </div>
                </>
              )}

              {editingResource.resource.type === 'QUIZ' && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                    ℹ️ Quiz Questions
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Quiz questions are managed separately. After updating, use the Quiz Builder to edit questions.
                  </p>
                </div>
              )}

              <div>
                <Label>Duration (minutes)</Label>
                <Input name="duration" type="number" min="0" defaultValue={editingResource.resource.duration || ''} placeholder="Estimated duration" className="mt-1" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditingResource(null)}>Cancel</Button>
                <Button type="submit">Update Resource</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
