# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm run dev` - Start development server (runs on port 8080)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture Overview

This is a React-based Revenue Operations (RevOS) platform built with TypeScript, Vite, and Supabase. The application follows a modular dashboard architecture for managing business engagements, clients, AI agents, and revenue analytics.

### Key Technologies
- **Frontend:** React 18 + TypeScript + Vite
- **UI Framework:** shadcn/ui components with Radix UI primitives
- **Styling:** Tailwind CSS with theme support
- **Backend:** Supabase (authentication, database, edge functions)
- **State Management:** TanStack Query + React Context
- **Routing:** React Router v6

### Project Structure

**Core Application:**
- `src/App.tsx` - Main application router with protected routes
- `src/main.tsx` - Application entry point
- `src/hooks/useAuth.tsx` - Authentication context and state management

**Layout System:**
- `src/components/layout/DashboardLayout.tsx` - Main dashboard wrapper with sidebar navigation
- All authenticated routes use the DashboardLayout component

**Key Modules:**
- **Engagements** (`/engagements`) - Client engagement management
- **Analytics** (`/analytics`) - Revenue performance dashboards  
- **AI Agents** (`/agents`) - Intelligent automation deployment
- **Empire** (`/empire`) - Business portfolio management
- **IP Library** (`/library`) - Knowledge and framework repository

**UI Components:**
- `src/components/ui/` - Complete shadcn/ui component library
- Theme system with dark/light mode support via next-themes

### Authentication Flow

The app uses Supabase authentication with:
- Session persistence in localStorage
- Auth state managed via React Context (`useAuth` hook)
- Protected routes redirect unauthenticated users to `/auth`
- All dashboard routes wrapped in authentication checks

### Database & Backend

**Supabase Integration:**
- `src/integrations/supabase/client.ts` - Supabase client configuration
- `src/integrations/supabase/types.ts` - TypeScript types from database schema
- `supabase/migrations/` - Database schema migrations
- `supabase/functions/` - Edge functions (e.g., agent-chat)

### Navigation Structure

The sidebar navigation supports nested routes with automatic expansion:
- Dashboard (landing page with metrics overview)
- Engagements (with sub-routes for list/new/edit)
- Analytics & Executive dashboards
- Client Management
- Revenue Operations  
- AI Agents (with deployment capabilities)
- User Management
- Settings

### Development Notes

**Routing:**
- All protected routes use `<DashboardLayout>` wrapper
- Route patterns follow RESTful conventions (e.g., `/resource`, `/resource/new`, `/resource/:id`)
- Authentication guards implemented at route level

**State Management:**
- TanStack Query for server state
- React Context for global state (auth, settings)
- Local component state for UI interactions

**Styling:**
- Tailwind CSS with design system approach
- CSS custom properties for theming
- Responsive design patterns throughout

**Error Handling:**
- Toast notifications via sonner
- Form validation with react-hook-form + zod
- Authentication error handling in auth provider