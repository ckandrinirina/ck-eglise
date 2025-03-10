# Next.js Project Architecture

<!-- Note: All markdown files in docs are always short. -->

## Directory Structure

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── [locale]/          # Locale-based routes (all pages must be here)
│   │   ├── (routes)/      # Route groups
│   │   ├── auth/          # Auth routes (localized)
│   │   ├── layout.tsx     # Localized root layout
│   │   └── page.tsx       # Localized root page
│   └── api/               # API routes (non-localized)
├── components/            # React components
│   ├── ui/               # Basic UI components
│   └── shared/           # Complex shared components
│       ├── auth/         # Authentication related components
│       ├── admin/        # Admin dashboard components
│       ├── i18n/         # Internationalization components
│       ├── layout/       # Layout related components
│       └── common/       # Cross-cutting components
├── lib/                  # Utilities & helpers
│   ├── services/         # API service files
│   └── db.ts            # Database utility functions
├── hooks/                # Custom React hooks
│   ├── user/            # User-related hooks
│   ├── auth/            # Authentication-related hooks
│   ├── admin/           # Admin-related hooks
│   └── common/          # General purpose hooks
├── types/                # TypeScript definitions
├── styles/              # Global styles
├── prisma/              # Prisma ORM configuration and database files
│   ├── schema.prisma    # Prisma schema definition
│   ├── migrations/      # Database migrations
│   ├── database.sqlite  # SQLite database file
│   └── seed.ts         # Database seed script
```

## Tech Stack

### Core Technologies
- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: SQLite with Prisma ORM
- **State Management**: React Server Components + Hooks
- **Data Fetching**: TanStack React Query (required for ALL API queries)
- **Form Handling**: React Hook Form
- **Package Manager**: pnpm (Fast, disk space efficient alternative to npm)

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **CSS Framework**: Tailwind CSS
- **CI/CD**: GitHub Actions

## Coding Conventions

### Component Pattern
```tsx
// All components use arrow functions
const Component = ({ props }) => {
  return <div>{/* content */}</div>
}

// shadcn/ui usage
import { Button } from "@/components/ui/button"

// Component logic must be separated into dedicated files
// ✅ Correct Pattern
// UserList.tsx
import { useUserLogic } from './useUserLogic' // Logic in separate file

const UserList = () => {
  const { users, loading, error } = useUserLogic()
  return <div>{/* UI rendering only */}</div>
}

// useUserLogic.ts
export const useUserLogic = () => {
  // Business logic, data fetching, state management
  return { users, loading, error }
}

// ❌ Incorrect Pattern
// Don't mix complex logic with component UI
const UserList = () => {
  // Complex business logic mixed with UI
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  // ... more logic here
  return <div>{/* UI with mixed concerns */}</div>
}
```

### Component Guidelines

- Each `.tsx` file should export only one component.
- All child components should be in separate files.
- Make all components as reusable as possible.
- Always optimize for performance using techniques like `useMemo`, `useCallback`, etc.

### Database Pattern
```ts
// Models are defined in schema.prisma
// Example of Prisma client usage:
const users = await prisma.user.findMany()

// Repository pattern for data access
const UserRepository = {
  findAll: async () => prisma.user.findMany(),
  create: async (data) => prisma.user.create({ data })
}
```

### Prisma Commands
All Prisma commands must be executed from the src/prisma directory:

```bash
# Navigate to prisma directory first
cd src/prisma

# Generate Prisma Client
pnpm prisma generate

# Create and apply migrations
pnpm prisma migrate dev

# Reset database
pnpm prisma reset

# Push schema changes directly (development only)
pnpm prisma db push

# Run seed script
pnpm prisma db seed
```

### Migration Guidelines
- Migrations must preserve existing data - no deletions allowed
- Use soft deletion by adding status/deleted_at fields
- Always include both up and down migration scripts
- Test thoroughly in development environment
- Document all data transformations
- Follow semantic versioning for migration names
- Include validation checks in migrations

### API Routes Pattern
```ts
// Route handlers use initialization check
export const GET = async () => {
  await initializeDB()
  // Logic here
}
```

### Type Definitions Pattern
```ts
// All interface and type definitions must be placed in the types folder
// ✅ Correct Pattern
// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

// ❌ Incorrect Pattern
// Don't define types/interfaces in component or hook files
// src/components/UserList.tsx
interface User { // ❌ Should be in types folder
  id: string;
  name: string;
}
```

### Data Fetching Pattern
```tsx
// All API queries MUST use TanStack React Query
// ✅ Correct Pattern
const usersQuery = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers
})

// ❌ Incorrect Patterns
// Don't use fetch/axios directly
const users = await fetch('/api/users')

// Don't use SWR or other data fetching libraries
const { data } = useSWR('/api/users')
```

### API Service Pattern
```ts
// All API calls must be placed in dedicated service files under src/lib/services
// Example structure:
// src/lib/services/user.service.ts

import axios from 'axios';

// Create axios instance with common config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Correct Pattern - Service-based API calls
export const UserService = {
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`)
}

// Usage in components/hooks with React Query
const usersQuery = useQuery({
  queryKey: ['users'],
  queryFn: () => UserService.getUsers()
})

// ❌ Incorrect Pattern - Direct API calls in components/hooks
const users = await fetch('/api/users')
const users = await axios.get('/api/users')
```

### Form and Query Patterns
```tsx
// React Hook Form usage
const form = useForm<FormSchema>({
  resolver: zodResolver(formSchema)
})

// TanStack React Query usage
const query = useQuery({
  queryKey: ['data'],
  queryFn: fetchData
})
```

### Routing Pattern
```tsx
// All pages including auth must be under [locale] directory for translation support
src/app/[locale]/dashboard/page.tsx   // ✅ Correct
src/app/[locale]/auth/login/page.tsx  // ✅ Correct
src/app/dashboard/page.tsx            // ❌ Incorrect
src/app/auth/login/page.tsx           // ❌ Incorrect

// Only API routes can be outside [locale]
src/app/api/auth/login/route.ts       // ✅ Correct
```

## Key Principles

### Frontend
1. All pages must be under [locale] directory
2. Use React Server Components by default
3. Client components only when needed
4. shadcn/ui for UI components
5. Tailwind for styling
6. Arrow functions everywhere
7. Use Next.js Image component (<Image />) from 'next/image' for all images to ensure optimal performance and loading

### Backend
1. SQLite for database
2. Prisma for ORM
3. Repository pattern
4. Migrations for schema changes
5. Environment-based config

### Testing
1. All functionality must have corresponding tests
2. Components must have unit tests
3. API routes must have integration tests
4. Database operations must have repository tests
5. Use Jest and React Testing Library
6. Tests must be co-located with the code they test in __tests__ directories

## Layouts

Our project uses two main layouts:
- Authenticated Layout: for pages accessible after user login, providing navigation and user-specific content.
- Authentication Layout: dedicated to authentication flows (login, logout, etc.) to ensure a secure and streamlined process.

## Code Organization
1. Group by feature in both routes and components
   - Routes grouped under app/[locale]
   - Components grouped by feature under components/shared
   - Each feature (auth, admin, etc.) has its own directory
2. UI components in components/ui
3. Feature-specific shared components in components/shared/[feature]
4. Cross-cutting components in components/shared/common
5. Custom hooks grouped by feature in hooks/[feature]
   - User-related hooks in hooks/user
   - Authentication-related hooks in hooks/auth
   - Each feature has its own dedicated hooks directory
6. Database logic in repositories
7. Utils in lib directory
8. Types in dedicated files

## Environment Setup
```
DATABASE_URL="file:./database.sqlite"
NODE_ENV="development"
```

## Component Management
- For adding new shadcn components, always use the command: `pnpm dlx shadcn@latest add [component name]`
- Never manually create or copy shadcn component files

For detailed implementation examples, refer to the specific sections in the codebase.