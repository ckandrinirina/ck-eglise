import { NextResponse } from "next/server";

export async function GET() {
  // Only return non-sensitive environment variables
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    defaultLocale: process.env.DEFAULT_LOCALE,
    supportedLocales: process.env.SUPPORTED_LOCALES,
    databaseUrl: process.env.DATABASE_URL?.includes("sqlite"), // Just return if it includes sqlite for security
  });
}
