# 🎨 White Board Design System

## Design Philosophy

White Board's design system is inspired by modern, clean interfaces like [Minimals.cc](https://minimals.cc), focusing on:

- **Simplicity**: Clear, uncluttered interfaces
- **Consistency**: Unified design language
- **Accessibility**: Inclusive and usable by everyone
- **Responsiveness**: Beautiful on all devices
- **Performance**: Smooth, fast interactions

## Color System

### Primary Colors

```css
/* Light Mode */
--primary: 221.2 83.2% 53.3%; /* Blue #3B82F6 */
--primary-foreground: 210 40% 98%; /* Near White */

/* Dark Mode */
--primary: 217.2 91.2% 59.8%; /* Lighter Blue */
--primary-foreground: 222.2 47.4% 11.2%; /* Dark Blue */
```

### Semantic Colors

```css
--destructive: 0 84.2% 60.2%; /* Red - Errors, Danger */
--success: 142 76% 36%; /* Green - Success */
--warning: 38 92% 50%; /* Yellow - Warnings */
--info: 199 89% 48%; /* Cyan - Information */
```

### Neutral Colors

```css
--background: 0 0% 100%; /* White */
--foreground: 222.2 84% 4.9%; /* Almost Black */
--muted: 210 40% 96.1%; /* Light Gray */
--muted-foreground: 215.4 16.3% 46.9%; /* Mid Gray */
--border: 214.3 31.8% 91.4%; /* Border Gray */
```

### Color Usage

- **Primary**: Call-to-action buttons, active states, important highlights
- **Destructive**: Delete actions, error messages, critical warnings
- **Muted**: Backgrounds, disabled states, less important text
- **Border**: Dividers, card outlines, input borders

## Typography

### Font Families

```css
--font-sans: "Geist Sans", system-ui, sans-serif;
--font-mono: "Geist Mono", "Courier New", monospace;
```

### Font Scale

```css
text-xs:   0.75rem   (12px)   /* Small labels */
text-sm:   0.875rem  (14px)   /* Body small */
text-base: 1rem      (16px)   /* Body */
text-lg:   1.125rem  (18px)   /* Emphasized text */
text-xl:   1.25rem   (20px)   /* Subheadings */
text-2xl:  1.5rem    (24px)   /* Section headers */
text-3xl:  1.875rem  (30px)   /* Page titles */
text-4xl:  2.25rem   (36px)   /* Hero text */
```

### Font Weights

```css
font-normal:    400   /* Body text */
font-medium:    500   /* Emphasis */
font-semibold:  600   /* Subheadings */
font-bold:      700   /* Headings */
```

### Line Heights

```css
leading-tight:  1.25    /* Headings */
leading-normal: 1.5     /* Body text */
leading-relaxed: 1.625  /* Long-form content */
```

## Spacing System

### Scale (based on 4px grid)

```css
0:    0px
1:    0.25rem  (4px)
2:    0.5rem   (8px)
3:    0.75rem  (12px)
4:    1rem     (16px)
5:    1.25rem  (20px)
6:    1.5rem   (24px)
8:    2rem     (32px)
10:   2.5rem   (40px)
12:   3rem     (48px)
16:   4rem     (64px)
20:   5rem     (80px)
```

### Usage Guidelines

- **Gap between items**: 4 (16px)
- **Card padding**: 6 (24px)
- **Section spacing**: 8-12 (32-48px)
- **Page margins**: 6-8 (24-32px)

## Border Radius

```css
--radius: 0.5rem;  /* Default: 8px */

rounded-none: 0px
rounded-sm:   0.125rem  (2px)
rounded:      0.25rem   (4px)
rounded-md:   0.375rem  (6px)
rounded-lg:   0.5rem    (8px)
rounded-xl:   0.75rem   (12px)
rounded-2xl:  1rem      (16px)
rounded-full: 9999px
```

### Usage

- **Buttons**: rounded-md (6px)
- **Cards**: rounded-xl (12px)
- **Inputs**: rounded-md (6px)
- **Avatars**: rounded-full
- **Badges**: rounded-md or rounded-full

## Shadows

```css
shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05)
shadow:     0 1px 3px rgba(0, 0, 0, 0.1)
shadow-md:  0 4px 6px rgba(0, 0, 0, 0.1)
shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1)
shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.1)
```

### Usage

- **Cards**: shadow (default), shadow-lg (hover)
- **Dropdowns**: shadow-lg
- **Modals**: shadow-xl
- **Floating elements**: shadow-md

## Components

### Buttons

#### Variants

```tsx
<Button variant="default">    {/* Primary action */}
<Button variant="secondary">  {/* Secondary action */}
<Button variant="outline">    {/* Tertiary action */}
<Button variant="ghost">      {/* Subtle action */}
<Button variant="link">       {/* Link-style button */}
<Button variant="destructive"> {/* Dangerous action */}
```

#### Sizes

```tsx
<Button size="sm">      {/* 32px height */}
<Button size="default"> {/* 36px height */}
<Button size="lg">      {/* 40px height */}
<Button size="icon">    {/* 36x36 square */}
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>{/* Main content */}</CardContent>
  <CardFooter>{/* Actions */}</CardFooter>
</Card>
```

### Input Fields

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
```

### Badges

```tsx
<Badge variant="default">   {/* Primary */}
<Badge variant="secondary"> {/* Secondary */}
<Badge variant="outline">   {/* Outlined */}
<Badge variant="destructive"> {/* Error/Delete */}
```

## Icons

### Iconsax React

We use Iconsax for consistent, beautiful icons:

#### Variants

```tsx
<Book1 variant="Linear" />  {/* Default outline */}
<Book1 variant="Bold" />    {/* Filled/solid */}
<Book1 variant="Bulk" />    {/* Duotone effect */}
<Book1 variant="Broken" />  {/* Broken lines */}
```

#### Sizes

```tsx
<Book1 size={16} />  {/* Small */}
<Book1 size={20} />  {/* Medium (default) */}
<Book1 size={24} />  {/* Large */}
```

#### Common Icons

- **Home2**: Dashboard/Home
- **Book1**: Courses/Education
- **Calendar**: Events/Schedule
- **Messages2**: Chat/Messages
- **Chart**: Analytics/Reports
- **People**: Students/Users
- **Setting2**: Settings/Configuration

## Animations

### Framer Motion Patterns

#### Stagger Children

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};
```

#### Hover Effects

```tsx
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400 }}
>
```

#### Layout Animations

```tsx
<motion.div layoutId="unique-id">{/* Animates between states */}</motion.div>
```

### Transition Guidelines

- **Duration**: 200-300ms for most interactions
- **Easing**: Use spring physics for natural feel
- **Stagger**: 50-100ms between items
- **Hover**: Subtle scale (1.02) or shadow increase

## Responsive Design

### Breakpoints

```css
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

### Mobile-First Approach

```tsx
<div className="
  grid grid-cols-1     {/* Mobile: 1 column */}
  md:grid-cols-2       {/* Tablet: 2 columns */}
  lg:grid-cols-4       {/* Desktop: 4 columns */}
">
```

### Responsive Spacing

```tsx
<div className="
  p-4        {/* Mobile: 16px */}
  md:p-6     {/* Tablet: 24px */}
  lg:p-8     {/* Desktop: 32px */}
">
```

## Layout Patterns

### Dashboard Grid

```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  {/* Stats cards */}
</div>

<div className="grid gap-6 lg:grid-cols-2">
  {/* Main content areas */}
</div>
```

### Sidebar Layout

```tsx
<div className="flex min-h-screen">
  <aside className="w-64 fixed"> {/* Sidebar */}
  <div className="pl-64"> {/* Main content */}
    <header className="sticky top-0"> {/* Header */}
    <main className="p-6"> {/* Content */}
  </div>
</div>
```

## Dark Mode

### Implementation

Using CSS variables for seamless theme switching:

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... inverted colors */
}
```

### Best Practices

- Test all components in both modes
- Use semantic color variables (not direct colors)
- Ensure sufficient contrast in both modes
- Consider images/illustrations appearance

## Accessibility

### Color Contrast

- **Normal text**: 4.5:1 minimum (WCAG AA)
- **Large text**: 3:1 minimum (WCAG AA)
- **Interactive elements**: Clear focus indicators

### Focus States

```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-primary
focus-visible:ring-offset-2
```

### Keyboard Navigation

- All interactive elements focusable
- Logical tab order
- Skip navigation links
- Keyboard shortcuts documented

## Form Design

### Input States

```tsx
{/* Normal */}
<Input />

{/* Disabled */}
<Input disabled />

{/* Error */}
<Input className="border-destructive" />
<p className="text-destructive text-sm">Error message</p>

{/* Success */}
<Input className="border-green-500" />
```

### Form Layout

```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label>Field Label</Label>
    <Input />
    <p className="text-xs text-muted-foreground">Helper text</p>
  </div>
</form>
```

## Component Composition

### Building Complex UIs

Compose simple components into complex interfaces:

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Title</CardTitle>
      <Button size="sm">Action</Button>
    </div>
  </CardHeader>
  <CardContent>
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">{/* Content */}</TabsContent>
    </Tabs>
  </CardContent>
</Card>
```

## Best Practices

### Do's ✅

- Use semantic HTML elements
- Follow consistent spacing
- Maintain color contrast
- Test on multiple devices
- Use accessible components
- Implement smooth animations
- Keep designs simple and clean

### Don'ts ❌

- Hardcode colors (use CSS variables)
- Ignore mobile experience
- Skip accessibility features
- Over-animate (keep it subtle)
- Use inconsistent spacing
- Mix different design patterns
- Create inaccessible forms

## Resources

- **Color Tool**: [Tailwind Color Generator](https://uicolors.app)
- **Icons**: [Iconsax](https://iconsax.io)
- **Components**: [shadcn/ui](https://ui.shadcn.com)
- **Inspiration**: [Minimals.cc](https://minimals.cc)
- **Accessibility**: [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
