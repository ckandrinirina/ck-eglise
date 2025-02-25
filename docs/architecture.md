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
├── lib/                  # Utilities & helpers
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
├── styles/              # Global styles
├── db/                   # Database architecture
│   ├── schema.prisma     # Prisma schema definition
│   ├── migrations/      # Database migrations
│   ├── seeders/         # Seed data
│   ├── config.ts        # Database configuration
│   └── index.ts         # Database connection
└── lib/
    └── db.ts            # Database utility functions
```

## Tech Stack

### Core Technologies
- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: SQLite with Prisma ORM
- **State Management**: React Server Components + Hooks
- **Data Fetching**: TanStack React Query
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
```

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

### API Routes Pattern
```ts
// Route handlers use initialization check
export const GET = async () => {
  await initializeDB()
  // Logic here
}
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

## Layouts

Our project uses two main layouts:
- Authenticated Layout: for pages accessible after user login, providing navigation and user-specific content.
- Authentication Layout: dedicated to authentication flows (login, logout, etc.) to ensure a secure and streamlined process.

## Code Organization
1. Group by feature in routes
2. Shared components in ui/shared
3. Database logic in repositories
4. Utils in lib directory
5. Types in dedicated files

## Environment Setup
```
DATABASE_URL="file:./database.sqlite"
NODE_ENV="development"
```

For detailed implementation examples, refer to the specific sections in the codebase.