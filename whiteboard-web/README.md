# 🎓 White Board - Modern Learning Management Platform

White Board is a comprehensive learning management platform similar to Blackboard, designed with exceptional UI/UX principles and clean architecture.

![White Board](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)
![PWA](https://img.shields.io/badge/PWA-Enabled-purple?style=for-the-badge)

## ✨ Features

### 🎯 Core Functionality

- **📊 Dashboard**: Comprehensive overview with stats, recent courses, assignments, and upcoming events
- **📚 Courses**: Browse and manage enrolled courses with progress tracking
- **📅 Calendar**: Visual calendar with event management
- **💬 Messages**: Real-time messaging with instructors and classmates
- **📈 Analytics**: Detailed performance tracking and insights
- **👥 Students**: Student directory and collaboration tools
- **⚙️ Settings**: Complete profile and account management

### 🚀 Technical Features

- **Progressive Web App (PWA)**: Installable, works offline, push notifications ready
- **Responsive Design**: Fully responsive across all devices
- **Modern UI Components**: Built with shadcn/ui and Radix UI
- **Smooth Animations**: Powered by Framer Motion
- **Icon System**: Beautiful icons from Iconsax React
- **TypeScript**: Fully typed for better developer experience
- **Clean Architecture**: Well-organized folder structure and code organization
- **AI Chatbot**: Intelligent assistant powered by Google Gemini AI to help users navigate the platform

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Iconsax React
- **Animations**: Framer Motion
- **PWA**: @ducanh2912/next-pwa
- **State Management**: React Hooks
- **Code Quality**: ESLint

## 📁 Project Structure

```
whiteboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard page
│   │   ├── courses/            # Courses page
│   │   ├── calendar/           # Calendar page
│   │   ├── messages/           # Messages page
│   │   ├── analytics/          # Analytics page
│   │   ├── students/           # Students page
│   │   ├── settings/           # Settings page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # Reusable UI components (shadcn)
│   │   ├── layout/             # Layout components
│   │   │   ├── sidebar.tsx     # Main navigation sidebar
│   │   │   ├── header.tsx      # Top header bar
│   │   │   └── dashboard-layout.tsx
│   │   └── dashboard/          # Dashboard-specific components
│   │       ├── stats-cards.tsx
│   │       ├── recent-courses.tsx
│   │       ├── upcoming-events.tsx
│   │       └── recent-assignments.tsx
│   └── lib/
│       └── utils.ts            # Utility functions
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # PWA icons (to be added)
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git

### Installation

1. **Clone the repository** (if applicable)

   ```bash
   git clone <repository-url>
   cd whiteboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

### PWA Features

The application is configured as a Progressive Web App with:

- **Service Worker**: Automatic caching and offline support
- **Manifest**: App installation on mobile and desktop
- **Icons**: Multiple sizes for different devices
- **Shortcuts**: Quick access to key features

To test PWA features:

1. Build the production version
2. Serve it over HTTPS (required for PWA)
3. Use Chrome DevTools > Application > Manifest to test

## 🎨 Design System

### Colors

The application uses a sophisticated color system with support for light and dark modes:

- **Primary**: Blue (#3B82F6)
- **Secondary**: Slate gray
- **Accent**: Various contextual colors
- **Success**: Green
- **Warning**: Yellow
- **Error**: Red

### Typography

- **Font Family**: Geist Sans (primary), Geist Mono (code)
- **Font Sizes**: Responsive scale from xs to 3xl

### Components

All UI components are built with:

- **Accessibility** in mind (ARIA labels, keyboard navigation)
- **Variants** for different use cases
- **Animations** for smooth transitions

## 🎯 Key Pages & Features

### Dashboard (`/dashboard`)

- Overview statistics cards
- Recent courses with progress
- Upcoming events calendar
- Recent assignments tracker

### Courses (`/courses`)

- Course grid with detailed cards
- Progress tracking
- Instructor information
- Schedule display

### Calendar (`/calendar`)

- Full month view
- Event management
- Color-coded event types
- Quick navigation

### Messages (`/messages`)

- Conversation list
- Real-time chat interface
- Search functionality
- Message threading

### Analytics (`/analytics`)

- Performance metrics
- Subject-wise breakdown
- Study hours tracking
- Personalized insights

### Students (`/students`)

- Student directory
- Quick contact options
- Status indicators
- Search and filter

### Settings (`/settings`)

- Profile management
- Account security
- Notification preferences
- Theme customization

## 🔧 Customization

### Adding New Components

Use shadcn CLI to add new components:

```bash
npx shadcn-ui@latest add [component-name]
```

### Modifying Theme

Edit `src/app/globals.css` to customize:

- Color variables
- Spacing
- Border radius
- Shadows

### Adding New Pages

1. Create a new folder in `src/app/`
2. Add a `page.tsx` file
3. Wrap content with `DashboardLayout`
4. Add navigation link in `src/components/layout/sidebar.tsx`

## 📱 PWA Installation

### Desktop (Chrome/Edge)

1. Click the install icon in the address bar
2. Or go to Menu > Install White Board

### Mobile (Android)

1. Tap the menu (3 dots)
2. Select "Add to Home screen"

### Mobile (iOS)

1. Tap the Share button
2. Select "Add to Home Screen"

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- UI Components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Iconsax](https://iconsax.io)
- Animation library [Framer Motion](https://www.framer.com/motion)

**Built with ❤️ using Next.js and modern web technologies**
