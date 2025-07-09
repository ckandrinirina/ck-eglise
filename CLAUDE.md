# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 church management application built with TypeScript, using the App Router and SQLite database. The project features a multi-language interface (English, French, Malagasy) with admin panels for user management, financial transactions, and dropdown configuration.

## Core Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Internationalization**: next-intl
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Data Fetching**: TanStack React Query (required for ALL client-side queries)
- **Forms**: React Hook Form + Zod validation
- **Package Manager**: pnpm

## Essential Commands

### Development
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Lint and type check (run before commits)
pnpm lint
pnpm typecheck

# Combined pre-commit check
pnpm precommit
```

### Database Operations
```bash
# Generate Prisma client
pnpm prisma:generate

# Apply migrations
pnpm prisma:migrate

# Open Prisma Studio
pnpm prisma:studio

# Seed admin user
pnpm seed:admin

# Seed dropdown data
pnpm seed:dropdown
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run a single test file
pnpm test ComponentName.test.tsx

# Run tests with coverage
pnpm test --coverage
```

## Database Schema

The application uses SQLite with Prisma ORM. Key models:

- **User**: Authentication and user management with roles (admin/user), territories, and functions
- **Transaction**: Financial transactions with sender/receiver, amounts, and types
- **SiteBalance**: Current site balance tracking
- **Dropdown**: Hierarchical dropdown system for territories, functions, transaction types, and months
- **Account/Session**: NextAuth.js authentication models

## Architecture Patterns

### Directory Structure
```
src/
├── app/[locale]/          # Localized routes (ALL pages must be here)
├── components/
│   ├── ui/               # shadcn/ui components
│   └── shared/           # Feature-specific components
├── hooks/                # Custom React hooks (grouped by feature)
├── lib/
│   ├── services/         # API service layer
│   ├── auth.ts          # NextAuth configuration
│   └── db.ts            # Database utilities
├── types/               # TypeScript type definitions
└── prisma/              # Database schema and migrations
```

### Component Separation Pattern
- **UI Components**: Presentation only, no business logic
- **Logic Hooks**: Business logic separated into custom hooks
- **Service Layer**: API calls centralized in service files

Example:
```tsx
// ✅ Correct: Logic separated
const UserList = () => {
  const { users, loading, error } = useUserLogic(); // Custom hook
  return <div>{/* UI only */}</div>;
};

// ❌ Incorrect: Mixed concerns
const UserList = () => {
  const [users, setUsers] = useState([]);
  // Business logic mixed with UI
};
```

### Data Fetching Requirements
- ALL client-side API calls MUST use TanStack React Query
- API calls MUST be in service files under `src/lib/services/`
- Use axios with centralized configuration

### Type Definitions
- All interfaces and types MUST be in `src/types/` directory
- Group types by feature (users, transactions, dropdowns)

### Routing Requirements
- All pages (including auth) MUST be under `[locale]` directory
- Only API routes can be outside `[locale]`
- Support for three locales: en, fr, mg

## Key Features

### Authentication
- NextAuth.js with credentials provider
- Role-based access (admin/user)
- Session timeout: 30 days
- Localized auth pages

### Internationalization
- Three languages: English, French, Malagasy (default: French)
- Translation files in `public/locales/`
- Time zone: Indian/Antananarivo
- Uses next-intl library
- Language switching without page reload
- SEO-friendly URL structure with language prefixes

### Financial Management
- Transaction tracking with sender/receiver
- Site balance monitoring
- Monthly transaction reporting
- Transaction type categorization

### Admin Panel
- User management with territories and functions
- Dropdown configuration system
- Transaction oversight
- Role-based permissions

## Development Guidelines

### Component Management
- Use `pnpm dlx shadcn@latest add [component]` for new UI components
- Never manually create shadcn components

### Database Migrations
- Migrations MUST preserve existing data
- Use soft deletion (status/deleted_at fields)
- Test thoroughly before production

### Code Style
- Arrow functions everywhere
- Comprehensive JSDoc comments (see Documentation Standards below)
- Co-located tests in `__tests__` directories
- Use Next.js Image component for all images

### Documentation Standards
All code must include comprehensive JSDoc comments following these patterns:

#### Component Documentation
```tsx
/**
 * @component ComponentName
 * @description What the component does
 * 
 * @example
 * // Basic usage
 * <ComponentName prop="value" />
 * 
 * @param {PropType} propName - Description of the prop
 * @returns {JSX.Element} Description of what's rendered
 */
```

#### Hook Documentation
```tsx
/**
 * Description of what the hook does and when to use it
 * 
 * @hook
 * @param {ParamType} paramName - Description of the parameter
 * @returns {ReturnType} Description of returned values/functions
 * 
 * @example
 * // Basic usage example
 * const { data, isLoading } = useHookName(param)
 */
```

#### Service Documentation
```tsx
/**
 * Description of the service method
 * 
 * @async
 * @param {ParamType} paramName - Description of the parameter
 * @returns {Promise<ReturnType>} Description of the resolved value
 * @throws {ErrorType} Description of potential errors
 */
```

#### API Route Documentation
```tsx
/**
 * API endpoint description
 * 
 * @route {METHOD} /api/path
 * @access public/private/admin
 * @body {BodyType} Description of request body
 * @query {QueryType} Description of query parameters
 * @returns {ResponseType} Description of response
 */
```

### Form Patterns
```tsx
// Standard form setup
const form = useForm<FormSchema>({
  resolver: zodResolver(formSchema)
});

// With React Query mutation
const mutation = useMutation({
  mutationFn: UserService.createUser,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
});
```

## Testing Requirements

- Unit tests for all components
- Integration tests for API routes
- Repository tests for database operations
- Use Jest and React Testing Library

## File Naming Conventions

- Components: PascalCase (e.g., `UserList.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useUserLogic.ts`)
- Services: camelCase with `.service.ts` suffix
- Types: camelCase with `.ts` suffix in types directory

## Common Patterns

### API Route Pattern
```ts
export const GET = async () => {
  await initializeDB();
  // Route logic
};
```

### Service Pattern
```ts
export const UserService = {
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data)
};
```

### Query Pattern
```tsx
const usersQuery = useQuery({
  queryKey: ['users'],
  queryFn: () => UserService.getUsers()
});
```

## Specialized Components

### Dropdown Components
The application uses two specialized dropdown components:

#### DropdownSelect (Single Selection)
```tsx
import { DropdownSelect } from "@/components/shared/common/dropdown-select";

<DropdownSelect 
  dropdownKey="territory" 
  value={selectedValue} 
  onChange={(value) => setSelectedValue(value)} 
  placeholder="Select Territory"
/>
```

#### DropdownSelectMultiple (Multiple Selection)
```tsx
import { DropdownSelectMultiple } from "@/components/shared/common/dropdown-select-multiple";

<DropdownSelectMultiple 
  dropdownKey="branch" 
  value={selectedValues} 
  onChange={(values) => setSelectedValues(values)} 
  placeholder="Select Branches"
/>
```

**Key Requirements:**
- Use `DropdownSelect` for single selection only
- Use `DropdownSelectMultiple` for multiple selection only
- Always provide a specific `dropdownKey` that matches a parent dropdown in the database
- Handle return values appropriately (string vs string[])

### Authentication Patterns

#### Session Management
```tsx
// Client-side
const { data: session } = useSession();
const user = session?.user;

// Server-side
const session = await getServerSession(authOptions);
```

#### Route Protection
```tsx
// Client-side protection
const { isAuthenticated, isLoading } = useAuth();
if (isLoading) return <Loading />;
if (!isAuthenticated) return <Redirect />;

// Server-side protection
const user = await requireAuth(); // or requireAdmin() for admin routes
```

### Translation Usage
```tsx
// Use next-intl for all translations
const t = useTranslations("feature.namespace");

// Message usage
toast.success(t("success.message"));
```

**Translation file structure:**
```
public/locales/
├── en/
│   ├── common.json
│   └── finance.json
├── fr/
│   ├── common.json
│   └── finance.json
└── mg/
    ├── common.json
    └── finance.json
```

### Design Requirements

#### UI Components
- ALL UI components must use shadcn/ui
- Import from `@/components/ui`
- Complex shared components go in `@/components/shared`
- Follow responsive design patterns (mobile-first)

#### Layout Requirements
- Use authenticated layout for protected routes
- Use authentication layout for login/signup flows
- Maintain consistent padding and spacing
- Ensure proper ARIA labels and keyboard navigation

This application follows a feature-based architecture with clear separation of concerns, comprehensive internationalization, and robust financial management capabilities.