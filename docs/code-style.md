# Code Style Guidelines

## Markdown
- All markdown files in docs are always short.
- All markdown files in docs are written in English.
- All markdown lists in docs should be grouped by topic or category.

## Code
- All code should be commented thoroughly to ensure clarity and maintainability.

## Component Management
- For adding new shadcn components, always use the command: `pnpm dlx shadcn@latest add [component name]`
- Never manually create or copy shadcn component files

## Database Migrations
- All migrations should update data, never delete existing records
- Use soft deletion patterns when removing data is necessary
- Always provide migration rollback strategies
- Test migrations thoroughly in development before applying to production
- Document all data transformations in migration files
