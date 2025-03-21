# Vercel Deployment Instructions

This project uses Prisma ORM with SQLite. For proper deployment on Vercel, follow these instructions:

## Environment Variables

Make sure to add these environment variables in your Vercel project settings:

```
# Database Configuration
DATABASE_URL="file:./database.sqlite"

# NextAuth Configuration
NEXTAUTH_URL="https://your-production-url.vercel.app"
NEXTAUTH_SECRET="your-secure-secret-key" # Generate with `openssl rand -base64 32`

# Application Configuration
NODE_ENV="production"

# i18n Configuration
DEFAULT_LOCALE="fr"
SUPPORTED_LOCALES=["fr","mg","en"]
```

## Deployment Settings

1. The project is configured to build correctly with the included `vercel.json` and `vercel-build.sh` files.
2. Make sure that the SQLite database is properly handled in production (note that Vercel has ephemeral filesystems).
3. For production use, consider switching to a persistent database service (like Vercel Postgres, PlanetScale, etc.)

## Troubleshooting

If you encounter build errors:

1. Make sure all environment variables are properly set
2. Check that the build command executes Prisma generate before the Next.js build
3. Verify that the SQLite database path is correct for your environment
4. Check the logs for any specific error messages

## Database Considerations for Production

Note that Vercel has an ephemeral filesystem, which means:
- Any changes to the SQLite database during runtime will be lost after deployment
- Consider migrating to a persistent database solution for production
- For testing purposes, you can use the current setup, but the database will reset on each deployment 