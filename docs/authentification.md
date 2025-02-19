# Authentication

Our authentication system is built using NextAuth, fully integrated into our Next.js 13+ App Router architecture. API routes handling authentication (login, logout, and session queries) are organized under `src/app/api/auth/` with clear separation of concerns.

Key features:
- Username and password login supported via secure API endpoints.
- Session management handled in line with NextAuth best practices.
- Utilizes React Server Components for efficient rendering and Client Components only when needed.
- Follows Next.js API routes pattern with initialization checks (e.g., `initializeDB()`) before processing requests.

This design aligns with our overall project structure and principles, ensuring modular code, maintainability, and improved security while leveraging our established tech stack (Next.js, TypeScript, Tailwind CSS, Sequelize, and shadcn/ui).
