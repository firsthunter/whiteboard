# Responsive Component Quick Reference

## 📱 Mobile Navigation

### Sidebar Component

- **Desktop**: Fixed left sidebar (always visible)
- **Mobile**: Slide-in sidebar (triggered by hamburger menu)
- **Transition**: Smooth transform animation
- **Overlay**: Backdrop blur on mobile

```tsx
// Usage
<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
```

### Header Component

- **Hamburger Menu**: Only visible on mobile (lg:hidden)
- **Search Bar**: Hidden on mobile, visible on sm+
- **Icons**: Responsive sizing (sm:w-5 sm:h-5)
- **Settings**: Hidden on mobile (hidden sm:flex)

```tsx
// Usage
<Header onMenuClick={() => setSidebarOpen(true)} />
```

## 🎨 Responsive Cards

### Course Cards

```tsx
// Grid Layout
className = "grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2";

// Card Icon
className = "h-16 w-16 sm:h-20 sm:w-20 text-3xl sm:text-4xl";

// Title
className = "text-base sm:text-lg truncate";

// Badge
className = "text-xs sm:text-sm flex-shrink-0";
```

### Stats Cards

```tsx
// Grid Layout
className = "grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4";

// Title
className = "text-xs sm:text-sm truncate";

// Value
className = "text-xl sm:text-2xl lg:text-3xl";
```

## 🎯 Page Headers

```tsx
// Container
className =
  "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4";

// Title
className = "text-2xl sm:text-3xl font-bold";

// Button
className = "w-full sm:w-auto";
```

## 📊 Content Grids

### Dashboard Layout

```tsx
// Main Grid
className = "grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2";

// Spacing
className = "space-y-4 sm:space-y-6";
```

### Course Grid

```tsx
className = "grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2";
```

## 🎨 Welcome Banner

```tsx
// Container
className = "p-6 sm:p-8";

// Layout
className = "flex-col lg:flex-row gap-6";

// Title
className = "text-2xl sm:text-3xl lg:text-4xl";

// Badge
className = "px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm";

// Button
className = "w-full sm:w-auto";

// Illustration
className = "hidden lg:block";
```

## 💡 Common Patterns

### Spacing Scale

```tsx
p-4 sm:p-6 lg:p-8      // Padding
gap-4 sm:gap-6         // Gap
space-y-4 sm:space-y-6 // Vertical spacing
```

### Typography Scale

```tsx
text-xs sm:text-sm                    // Small text
text-sm sm:text-base                  // Body text
text-base sm:text-lg                  // Subheading
text-2xl sm:text-3xl                  // Heading
text-2xl sm:text-3xl lg:text-4xl     // Large heading
```

### Icon Sizing

```tsx
w-4 h-4 sm:w-5 sm:h-5                // Small icons
h-16 w-16 sm:h-20 sm:w-20            // Large icons
```

### Grid Patterns

```tsx
grid-cols-1                           // Mobile: stack
grid-cols-2 lg:grid-cols-4            // Mobile: 2, Desktop: 4
grid-cols-1 lg:grid-cols-2            // Mobile: stack, Desktop: 2
```

### Flex Patterns

```tsx
flex-col sm:flex-row                  // Stack on mobile
items-start lg:items-center           // Align differently
justify-between                       // Space between
gap-3 sm:gap-4                       // Responsive gap
```

### Visibility

```tsx
hidden lg:block                       // Desktop only
lg:hidden                            // Mobile only
hidden sm:flex                       // Tablet+
```

## 🎨 PWA Components

### Install Prompt

```tsx
// Position
className = "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96";

// Button
className = "flex-1 sm:flex-initial";
```

### Splash Screen

- Full screen gradient
- Centered content
- Animated logo
- Progress indicator

## ✅ Responsive Checklist

- [ ] Mobile menu works (< 1024px)
- [ ] Cards stack properly on mobile
- [ ] Text truncates on small screens
- [ ] Buttons are full-width on mobile
- [ ] Touch targets ≥ 44px
- [ ] No horizontal scroll
- [ ] Images are responsive
- [ ] Typography scales properly
- [ ] Spacing is consistent
- [ ] Icons are properly sized

## 🧪 Testing Viewports

### Chrome DevTools

1. F12 → Toggle Device Toolbar (Ctrl+Shift+M)
2. Test these sizes:
   - 375px (iPhone SE)
   - 390px (iPhone 12 Pro)
   - 768px (iPad)
   - 1024px (iPad Pro)
   - 1440px (Desktop)

### Firefox DevTools

1. F12 → Responsive Design Mode (Ctrl+Shift+M)
2. Test same breakpoints

## 📱 Common Breakpoints

```tsx
sm:  640px  // Small tablets
md:  768px  // Tablets
lg:  1024px // Small desktops
xl:  1280px // Desktops
2xl: 1536px // Large desktops
```

## 🎯 Best Practices

1. **Mobile First**: Start with mobile layout
2. **Progressive Enhancement**: Add features for larger screens
3. **Touch Friendly**: Minimum 44px touch targets
4. **Readable Text**: Minimum 16px base font
5. **Accessible**: Color contrast, keyboard navigation
6. **Performance**: Lazy load images, optimize bundles
