<!-- Note: All markdown files in docs are always short. -->

# Authentication

Our authentication system is built using NextAuth, fully integrated into our Next.js 13+ App Router architecture. While API routes handling authentication (login, logout, and session queries) are under `src/app/api/auth/`, the actual auth pages are localized under `src/app/[locale]/auth/` to support multiple languages.

Key features:
- Username and password login supported via secure API endpoints
- Localized authentication pages (login, register, etc.) under [locale]/auth/
- Session management handled in line with NextAuth best practices
- Utilizes React Server Components for efficient rendering and Client Components only when needed
- Follows Next.js API routes pattern with initialization checks (e.g., `initializeDB()`) before processing requests

This design aligns with our overall project structure and principles, ensuring modular code, maintainability, improved security, and full internationalization support while leveraging our established tech stack (Next.js, TypeScript, Tailwind CSS, Sequelize, and shadcn/ui).
