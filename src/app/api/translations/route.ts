import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lng = searchParams.get("lng");
    const ns = searchParams.get("ns");

    if (!lng || !ns) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const filePath = path.join(
      process.cwd(),
      "public",
      "locales",
      lng,
      `${ns}.json`,
    );

    if (!fs.existsSync(filePath)) {
      console.error(`Translation file not found: ${filePath}`);
      return new NextResponse("Translation file not found", { status: 404 });
    }

    const content = fs.readFileSync(filePath, "utf-8");
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Translation loading error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
