<!-- Note: All markdown files in docs are always short. -->

# Authentication

Our authentication system is built using NextAuth.js, fully integrated with Next.js 13+ App Router architecture and internationalization (i18n) support. The implementation follows a secure, modular approach with clear separation of concerns.

## Architecture Overview

### Directory Structure
- API routes: `src/app/api/auth/[...nextauth]`
- Auth pages: `src/app/[locale]/auth/*`  
- Components: `src/components/shared/auth/*`
- Utilities: `src/lib/auth.ts`

### Key Features
- Email/password authentication using credentials provider
- Secure session management with JWT strategy
- Role-based access control (user/admin)
- Internationalized authentication pages and messages
- Protected route middleware
- Persistent sessions (30-day duration)
- Automatic redirect handling

### Security Features
- Secure password handling with bcrypt
- CSRF protection
- Secure cookie-based session storage
- Protected API routes
- Input validation using Zod

### Session Management
- JWT-based sessions with 30-day expiration
- Automatic token refresh
- Secure session storage in cookies
- Role persistence across sessions

### Protected Routes
- Middleware-based route protection
- Role-based access control
- Automatic redirects to login
- Original URL preservation for post-login redirect

### User Experience
- Responsive authentication layout
- Form validation with error messages
- Loading states and error handling
- Toast notifications for status updates
- Language-aware redirects
- Session persistence across page reloads

### Integration Points
- Prisma adapter for database integration
- Next.js middleware for route protection
- React Server Components compatibility
- Tailwind CSS for styling
- shadcn/ui components for UI elements
