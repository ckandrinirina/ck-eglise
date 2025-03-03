# User Management Style Reference

## Type Definitions
```typescript
// All type definitions must be in /types/users/
export type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
};

export type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
};

export type UpdateUserData = Partial<{
  name: string;
  password: string;
  role: "user" | "admin";
}>;
```

## Service Pattern
```typescript
// All API calls must be in /lib/services/
export const UserService = {
  getUsers: (params?: { role?: string }) => api.get("/users", { params }),
  getUser: (userId: string) => api.get(`/users/${userId}`),
  createUser: (userData: CreateUserData) => api.post("/users", userData),
  updateUser: (userId: string, data: UpdateUserData) => api.put(`/users/${userId}`, data),
  deleteUser: (userId: string) => api.delete(`/users/${userId}`)
};
```

## Hook Pattern
```typescript
// All hooks must be in /hooks/[feature]/
export const useUserProfile = () => {
  // State management
  const [state, setState] = useState();
  
  // Query implementation
  const query = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => UserService.getUser(),
    staleTime: 300000, // 5 minutes
  });

  // Mutations
  const mutation = useMutation({
    mutationFn: (data) => UserService.updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile"]);
      toast.success(t("success.message"));
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error(t("error.message"));
    }
  });

  // Event handlers as callbacks
  const handleAction = useCallback(() => {
    // Implementation
  }, [dependencies]);

  return {
    data,
    isLoading,
    isError,
    handlers
  };
};
```

## Component Pattern
```typescript
// All components must be in /components/shared/[feature]/
interface ComponentProps {
  // Props interface
}

export const Component = ({ props }: ComponentProps) => {
  // Use dedicated hook for logic
  const { data, handlers } = useFeatureHook();

  return (
    // JSX using shadcn/ui components
  );
};
```

## Auth Patterns

### Session Management
```typescript
// Use next-auth session
const { data: session } = useSession();
const user = session?.user;

// For server-side
const session = await getServerSession(authOptions);
```

### Route Protection
```typescript
// Client-side protection
const { isAuthenticated, isLoading } = useAuth();
if (isLoading) return <Loading />;
if (!isAuthenticated) return <Redirect />;

// Server-side protection
const user = await requireAuth(); // or requireAdmin() for admin routes
```

## API Route Pattern
```typescript
// All API routes must be in /app/api/
export async function GET(request: Request) {
  // 1. Auth check
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  // 2. Request validation
  const { searchParams } = new URL(request.url);
  
  // 3. Database operation
  const data = await prisma.user.findMany();
  
  // 4. Response
  return NextResponse.json(data);
}
```

## Query Patterns

### Data Fetching
```typescript
// Use TanStack Query for all data fetching
const query = useQuery({
  queryKey: ["users"],
  queryFn: () => UserService.getUsers(),
  staleTime: 60000, // Define appropriate staleTime
  retry: 2 // Define retry strategy
});
```

### Mutations
```typescript
const mutation = useMutation({
  mutationFn: (data) => UserService.updateUser(data),
  onSuccess: () => {
    // 1. Invalidate relevant queries
    queryClient.invalidateQueries(["users"]);
    // 2. Show success toast
    toast.success(t("success.message"));
    // 3. Additional success actions
  },
  onError: (error) => {
    // 1. Log error
    console.error("Error:", error);
    // 2. Show error toast
    toast.error(t("error.message"));
    // 3. Additional error handling
  }
});
```

## Error Handling Pattern
```typescript
try {
  // Operation
  await operation();
} catch (error) {
  // 1. Console log
  console.error("Error:", error);
  // 2. User feedback
  toast.error(t("error.message"));
  // 3. Return appropriate response (for API routes)
  return new NextResponse("Error message", { status: 400 });
}
```

## Form Handling Pattern
```typescript
// Use React Hook Form with Zod
const form = useForm<FormSchema>({
  resolver: zodResolver(formSchema)
});

// Form submission
const onSubmit = (data: FormSchema) => {
  mutation.mutate(data);
};
```

## Internationalization Pattern
```typescript
// Use next-intl
const t = useTranslations("feature.namespace");

// Message usage
toast.success(t("success.message"));
```

## Filter and Sort Pattern
```typescript
// Define sort config type
type SortConfig = {
  field: "name" | "email" | "role";
  direction: "asc" | "desc";
};

// Implement filter and sort logic
const filteredAndSorted = useMemo(() => {
  let result = items;
  
  // Apply filters
  if (filter) {
    result = result.filter(item => /* filter logic */);
  }
  
  // Apply sort
  return result.sort((a, b) => /* sort logic */);
}, [items, filter, sort]);
```

## Code Commenting Requirements

### File Headers
```typescript
/**
 * @file Description of the file's purpose
 * @description Detailed description if needed
 * @module Module name (e.g., auth, users, etc.)
 */
```

### Component Documentation
```typescript
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

### Function Documentation
```typescript
/**
 * Description of what the function does
 * 
 * @param {ParamType} paramName - Description of the parameter
 * @returns {ReturnType} Description of the return value
 * @throws {ErrorType} Description of when/why errors are thrown
 */
```

### Interface/Type Documentation
```typescript
/**
 * Description of what this type represents
 * 
 * @interface or @type
 * @property {PropertyType} propertyName - Description of the property
 */
```

### Service Method Documentation
```typescript
/**
 * Description of the service method
 * 
 * @async (if applicable)
 * @param {ParamType} paramName - Description of the parameter
 * @returns {Promise<ReturnType>} Description of the resolved value
 * @throws {ErrorType} Description of potential errors
 */
```

### Hook Documentation
```typescript
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

### Code Block Comments
```typescript
// Group related code with block comments
// ----------------------------------------
// Authentication related operations
// ----------------------------------------

// Use section breaks for logical grouping
// ==========================================
// User Management Operations
// ==========================================
```

### Inline Comments
```typescript
// Use inline comments to explain complex logic
const result = complexCalculation(); // Explains what this calculation does

// TODO: Mark incomplete implementations
// FIXME: Mark code that needs attention
// NOTE: Add important notes about the code
```

### API Route Documentation
```typescript
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

### Database Operation Documentation
```typescript
/**
 * Description of the database operation
 * 
 * @transaction (if applicable)
 * @param {ParamType} paramName - Description of the parameter
 * @returns {Promise<ReturnType>} Description of the returned data
 * @throws {ErrorType} Description of potential database errors
 */
```

### Testing Documentation
```typescript
/**
 * @group Unit/Integration/E2E
 * @description What aspect of the code is being tested
 */
describe('Component/Function name', () => {
  /**
   * @test
   * @description What this specific test case verifies
   */
  it('should do something', () => {
    // Test implementation
  });
});
```

### Comment Style Guidelines

1. Always use English for comments
2. Keep comments concise but descriptive
3. Update comments when code changes
4. Remove commented-out code
5. Use JSDoc for public APIs and components
6. Comment complex algorithms step by step
7. Document known limitations or edge cases
8. Include references to related code or documentation
9. Add version information for deprecations
10. Document workarounds and their reasons