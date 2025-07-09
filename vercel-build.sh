#!/bin/bash
set -e

# Run vercel-build script from package.json which handles Prisma generation and Next.js build
pnpm vercel-build 