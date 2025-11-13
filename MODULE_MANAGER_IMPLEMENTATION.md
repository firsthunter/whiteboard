# Module Manager - Full Implementation Guide

## Overview
Complete CRUD (Create, Read, Update, Delete) implementation for modules and resources management in the instructor course management interface.

## Backend Status ✅
The backend is **fully implemented** and ready to use:

### API Endpoints Available:

**Module Management:**
- `POST /modules` - Create module
- `PUT /modules/:id` - Update module
- `DELETE /modules/:id` - Delete module
- `GET /modules/:id` - Get module by ID
- `GET /modules/course/:courseId` - Get all course modules

**Resource Management:**
- `POST /modules/resources` - Create resource
- `PUT /modules/resources/:id` - Update resource
- `DELETE /modules/resources/:id` - Delete resource

**Progress Tracking:**
- `POST /modules/resources/:id/progress` - Update resource progress
- `POST /modules/:id/progress` - Update module progress
- `GET /modules/course/:courseId/statistics` - Get course statistics

## Frontend Actions Status ✅
All action functions are implemented in `/actions/modules.ts`:

```typescript
// Already implemented:
- getCourseModules(courseId)
- createModule(courseId, data)
- updateModule(moduleId, data)
- deleteModule(moduleId)
- getModule(moduleId)
- createResource(moduleId, data)
- updateResource(resourceId, data)
- deleteResource(resourceId)
- updateResourceProgress(resourceId, data)
- updateModuleProgress(moduleId, data)
```

## Required Component Features

### Module Manager Component

#### State Management:
```typescript
const [modules, setModules] = useState<CourseModuleResponse[]>([]);
const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);

// Module dialogs
const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
const [editingModule, setEditingModule] = useState<CourseModuleResponse | null>(null);

// Resource dialogs
const [isCreateResourceOpen, setIsCreateResourceOpen] = useState(false);
const [resourceModuleId, setResourceModuleId] = useState<string | null>(null);
const [editingResource, setEditingResource] = useState<{moduleId: string; resource: ModuleResource} | null>(null);
```

#### Module Operations:

**1. Create Module:**
- Dialog with form fields:
  - Title (required)
  - Description (optional)
  - Published toggle (checkbox/switch)
- On submit: Call `createModule(courseId, data)`
- Auto-set order based on existing modules count
- Show success toast and reload modules

**2. Update Module:**
- Pre-fill form with existing module data
- Same fields as create
- On submit: Call `updateModule(moduleId, data)`
- Show success toast and reload modules

**3. Delete Module:**
- Confirm dialog warning about cascading deletion of resources
- On confirm: Call `deleteModule(moduleId)`
- Show success toast and reload modules

**4. List Modules:**
- Display modules in collapsible cards
- Show: Title, description, published status, resource count
- Expand/collapse to show resources
- Edit and Delete buttons per module

#### Resource Operations:

**1. Create Resource:**
- Dialog with form fields:
  - Title (required)
  - Description (optional)
  - Type (select dropdown):
    - VIDEO
    - DOCUMENT
    - READING
    - LINK
    - QUIZ
    - ASSIGNMENT
  - URL/Content (required) - for resource link or content
  - Additional Content (textarea) - for extra text
  - Duration (number) - estimated minutes
- On submit: Call `createResource(moduleId, data)`
- Auto-set order based on existing resources count
- Show success toast and reload modules

**2. Update Resource:**
- Pre-fill form with existing resource data
- Same fields as create
- On submit: Call `updateResource(resourceId, data)`
- Show success toast and reload modules

**3. Delete Resource:**
- Confirm dialog
- On confirm: Call `deleteResource(resourceId)`
- Show success toast and reload modules

**4. List Resources:**
- Display resources within expanded module
- Show: Icon (based on type), title, description, type badge, duration badge
- Edit and Delete buttons per resource

## UI Components Needed

### Dialogs:
1. Create Module Dialog (small width: max-w-md)
2. Edit Module Dialog (small width: max-w-md)
3. Create Resource Dialog (large width: max-w-2xl, scrollable)
4. Edit Resource Dialog (large width: max-w-2xl, scrollable)

### Form Elements:
- Input (for titles, URLs, numbers)
- Textarea (for descriptions and content)
- Label (for form labels)
- Select (for resource type dropdown)
- Checkbox or Switch (for published status)
- Button (for actions)

### Display Elements:
- Card (for module containers)
- Badge (for status and metadata)
- Icons from lucide-react:
  - Plus (add new)
  - Edit (edit action)
  - Trash2 (delete action)
  - ChevronDown/ChevronUp (expand/collapse)
  - BookOpen, Video, FileText, Link, FileQuestion (resource types)

## Data Flow

### Loading Modules:
```
Page Load → loadModules() → getCourseModules(courseId) → setModules(data)
```

### Creating Module:
```
User clicks "Add Module" 
→ Opens create dialog 
→ User fills form 
→ Submit → createModule(courseId, data) 
→ Success → Close dialog → Reload modules
```

### Creating Resource:
```
User expands module 
→ Clicks "Add Resource" 
→ Opens create dialog (with moduleId set)
→ User fills form 
→ Submit → createResource(moduleId, data) 
→ Success → Close dialog → Reload modules
```

## Resource Type Icons Mapping:
```typescript
const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  VIDEO: <Video className="h-4 w-4" />,
  DOCUMENT: <FileText className="h-4 w-4" />,
  READING: <BookOpen className="h-4 w-4" />,
  LINK: <LinkIcon className="h-4 w-4" />,
  QUIZ: <FileQuestion className="h-4 w-4" />,
  ASSIGNMENT: <FileText className="h-4 w-4" />,
};
```

## Error Handling

All operations should:
1. Use try-catch blocks
2. Show error toasts with meaningful messages
3. Log errors to console for debugging
4. Check result.success before proceeding
5. Handle loading states appropriately

## Best Practices

1. **Use executeAction from useAuthAwareAction hook** for all mutations to handle authentication
2. **Reload modules after any CUD operation** to ensure UI reflects latest state
3. **Validate form inputs** before submission
4. **Confirm destructive actions** (delete operations)
5. **Show loading states** during async operations
6. **Provide feedback** with success/error toasts
7. **Close dialogs on success** and reset form states
8. **Auto-expand modules** when adding resources for better UX

## Integration Points

### In Course Management Page:
```tsx
import { ModuleManager } from '@/components/courses/module-manager';

// In the Modules tab:
<TabsContent value="modules">
  <ModuleManager courseId={courseId} />
</TabsContent>
```

### Props:
```typescript
interface ModuleManagerProps {
  courseId: string;  // The course ID to manage modules for
}
```

## Testing Checklist

- [ ] Create module with all fields
- [ ] Create module with only required fields
- [ ] Edit module and update all fields
- [ ] Delete module (check cascade deletion)
- [ ] Create resource for each type
- [ ] Edit resource
- [ ] Delete resource
- [ ] Expand/collapse modules
- [ ] Multiple modules and resources
- [ ] Error handling (network errors, validation)
- [ ] Loading states
- [ ] Toast notifications
- [ ] Dialog open/close behavior
- [ ] Form reset after submission

## Schema Reference

### CourseModule:
```typescript
{
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  resources?: ModuleResource[];
}
```

### ModuleResource:
```typescript
{
  id: string;
  moduleId: string;
  title: string;
  description?: string | null;
  type: ResourceType; // 'VIDEO' | 'DOCUMENT' | 'READING' | 'LINK' | 'QUIZ' | 'ASSIGNMENT'
  content: string; // URL or embedded content
  duration?: number | null; // in minutes
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Next Steps

1. Create the module-manager.tsx component with all CRUD operations
2. Ensure all UI components are imported correctly
3. Test each operation thoroughly
4. Add polish (animations, better UX, etc.)
5. Consider drag-and-drop reordering for modules/resources (future enhancement)

---

**Status:** Backend ✅ Complete | Frontend Actions ✅ Complete | Component UI ⏳ Pending

The backend and all action functions are ready. You need to create the complete ModuleManager component with all the forms and dialogs as described above.
