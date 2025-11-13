# Course Navigation Flow

## 📍 Current Clean Structure

```
whiteboard-web/src/app/(dashboard)/courses/
├── page.tsx                          → Main courses listing (all users)
├── manage/
│   └── page.tsx                      → Instructor's course management list
└── [id]/
    ├── page.tsx                      → Course detail page (all users)
    ├── learn/
    │   └── page.tsx                  → Student learning interface
    └── manage/
        └── page.tsx                  → Instructor management hub
```

---

## 🎓 Student Flow

```
                    ┌─────────────────┐
                    │   /courses      │
                    │                 │
                    │ • My Courses    │
                    │ • Available     │
                    └────────┬────────┘
                             │
                             │ Click "View Course"
                             ▼
                    ┌─────────────────┐
                    │ /courses/[id]   │
                    │                 │
                    │ Tabs:           │
                    │ • Overview      │
                    │ • Modules       │
                    │ • Assignments   │
                    │ • Syllabus      │
                    │ • Students      │
                    └────────┬────────┘
                             │
                             │ Click "Continue Learning"
                             ▼
                    ┌─────────────────┐
                    │/courses/[id]/   │
                    │     learn       │
                    │                 │
                    │ • Module Nav    │
                    │ • Resources     │
                    │ • Progress      │
                    └─────────────────┘
```

---

## 👨‍🏫 Instructor Flow

```
                    ┌─────────────────┐
                    │   /courses      │
                    │                 │
                    │ "Manage My      │
                    │  Courses" btn   │
                    └────┬────────┬───┘
                         │        │
          ┌──────────────┘        └──────────────┐
          │                                      │
          │ Manage My Courses                    │ View Course
          ▼                                      ▼
┌─────────────────┐                   ┌─────────────────┐
│/courses/manage  │                   │ /courses/[id]   │
│                 │                   │                 │
│ List of my      │                   │ Same as student │
│ courses with:   │                   │ + "Manage       │
│ • View btn      │◄──────────────────┤   Course" btn   │
│ • Manage btn    │    Navigate back  │                 │
└────────┬────────┘                   └────────┬────────┘
         │                                     │
         │ Click "Manage"                      │ Click "Manage Course"
         │                                     │
         └─────────────────┬───────────────────┘
                           │
                           ▼
                 ┌─────────────────┐
                 │ /courses/[id]/  │
                 │    manage       │
                 │                 │
                 │ 6 Management    │
                 │ Tabs:           │
                 │ ✓ Overview      │
                 │ ✓ Modules       │
                 │ ✓ Assignments   │
                 │ ✓ Announcements │
                 │ ✓ Students      │
                 │ ✓ Analytics     │
                 └─────────────────┘
```

---

## 🔐 Access Control

### Students:
- ✅ `/courses` - Browse and view enrolled courses
- ✅ `/courses/[id]` - View course details
- ✅ `/courses/[id]/learn` - Access learning interface
- ❌ `/courses/manage` - Redirect to `/courses`
- ❌ `/courses/[id]/manage` - Redirect to `/courses/[id]`

### Instructors:
- ✅ `/courses` - Browse courses + management button
- ✅ `/courses/[id]` - View course details + manage button
- ✅ `/courses/[id]/learn` - Can preview student experience
- ✅ `/courses/manage` - List their courses
- ✅ `/courses/[id]/manage` - Full management access (only their courses)

### Admins:
- ✅ All routes accessible
- ✅ Can manage all courses (not just their own)

---

## 🎯 Key Features Per Route

### `/courses` (Main Listing)
**For All Users:**
- Enrolled courses with progress
- Available courses to browse
- Auto-enrollment on access

**Additional for Instructors:**
- "Manage My Courses" button in header

---

### `/courses/[id]` (Course Detail)
**For Students:**
- View course information
- See progress (%, assignments completed)
- Access modules list
- View assignments with due dates
- See fellow students
- "Continue Learning" button → `/courses/[id]/learn`

**For Instructors:**
- All student features
- "Instructor" badge
- "Manage Course" button → `/courses/[id]/manage`
- View student perspective

---

### `/courses/[id]/learn` (Learning Interface)
**Students Only:**
- Sidebar with module navigation
- Resource viewer (PDFs, videos, links)
- Progress tracking per resource
- Sequential learning flow
- Mark resources as complete

---

### `/courses/manage` (Instructor Course List)
**Instructors Only:**
- Grid of cards showing their courses
- Each card shows:
  - Course title, code, description
  - Enrollment count
  - Course dates
  - "View" button → `/courses/[id]`
  - "Manage" button → `/courses/[id]/manage`
- "Create Course" button

---

### `/courses/[id]/manage` (Management Hub)
**Instructors Only (for their courses):**

**Tab 1: Overview**
- Course statistics (modules, assignments, students, announcements)
- Course information (code, description, dates, schedule, location)

**Tab 2: Modules**
- Create/edit/delete modules
- Manage module resources
- Reorder modules
- Add PDFs, videos, links

**Tab 3: Assignments**
- Create/edit/delete assignments
- Set due dates and points
- View submissions
- Grade assignments

**Tab 4: Announcements**
- Create/edit/delete announcements
- Pin important announcements
- Schedule announcements

**Tab 5: Students**
- View enrolled students
- See individual progress
- View grades
- Export student data

**Tab 6: Analytics**
- Course completion rates
- Assignment submission rates
- Student engagement metrics
- Progress charts

---

## 📊 Comparison: Before vs After

### Before Cleanup:
```
❌ Confusing overlap between /courses/[id] and /courses/manage/[courseId]
❌ Students saw management UI elements
❌ Instructors had 2 ways to manage same course
❌ Duplicate student management pages
❌ Unclear navigation paths
```

### After Cleanup:
```
✅ Clear separation: view vs manage
✅ Single source of truth for management
✅ Role-specific UI and navigation
✅ Intuitive flow for both user types
✅ No duplicate functionality
✅ Clean, maintainable structure
```

---

## 🚦 User Journey Examples

### Example 1: Student Enrolling and Learning
1. Visit `/courses` → sees available courses
2. Click "View Details" on a course → `/courses/[id]`
3. Auto-enrolled when accessing course
4. Click "Continue Learning" → `/courses/[id]/learn`
5. Navigate modules, complete resources
6. Return to `/courses` to see progress updated

### Example 2: Instructor Creating Assignment
1. Visit `/courses` → clicks "Manage My Courses"
2. Navigate to `/courses/manage` → sees course list
3. Click "Manage" on a course → `/courses/[id]/manage`
4. Switch to "Assignments" tab
5. Click "Create Assignment"
6. Fill form, set due date, points
7. Students immediately see new assignment

### Example 3: Instructor Viewing Student Progress
1. From `/courses/[id]` → clicks "Manage Course"
2. Navigate to `/courses/[id]/manage`
3. Switch to "Students" tab
4. View list of enrolled students
5. See individual progress and grades
6. Switch to "Analytics" tab for overview

---

## 🎨 Visual Hierarchy

```
Level 1: Main Browse
   /courses

Level 2: Course Details (Shared)
   /courses/[id]

Level 3A: Student Learning
   /courses/[id]/learn

Level 3B: Instructor Management
   /courses/manage
   /courses/[id]/manage
```

This structure ensures:
- **Shallow navigation** for common tasks
- **Deep navigation** for specialized tasks
- **Parallel paths** for students and instructors
- **No intersecting paths** that cause confusion

---

**Last Updated:** November 12, 2025
