import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Serve design HTML preview as standalone page
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const design = await prisma.design.findUnique({
      where: { id },
      select: {
        htmlPreview: true,
        cssCode: true,
        name: true,
      },
    });

    if (!design) {
      return new NextResponse("Design not found", { status: 404 });
    }

    // Combine HTML and CSS into a complete page
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${design.name} - Design Preview</title>
  <style>
    ${design.cssCode}
  </style>
</head>
<body>
  ${design.htmlPreview}
</body>
</html>`;

    return new NextResponse(fullHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving design preview:", error);
    return new NextResponse("Failed to load preview", { status: 500 });
  }
}
