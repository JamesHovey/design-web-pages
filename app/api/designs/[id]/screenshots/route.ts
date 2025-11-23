import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { generateScreenshots } from "@/lib/screenshots/screenshotGenerator";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: designId } = await context.params;

    // Fetch the design to verify ownership
    const design = await prisma.design.findUnique({
      where: { id: designId },
      include: { project: true },
    });

    if (!design) {
      return NextResponse.json(
        { error: "Design not found" },
        { status: 404 }
      );
    }

    // Verify project ownership
    if (design.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Generate screenshots for configured viewports
    const viewports = (design.project.viewports as string[]) || ["desktop"];

    console.log(`Generating screenshots for design ${designId} with viewports:`, viewports);

    const screenshots = await generateScreenshots(design.htmlPreview, viewports);

    // Convert base64 to data URLs
    const screenshotUrls: Record<string, string> = {};
    Object.entries(screenshots).forEach(([viewport, base64]) => {
      screenshotUrls[viewport] = `data:image/png;base64,${base64}`;
    });

    // Update design with screenshots
    await prisma.design.update({
      where: { id: designId },
      data: { screenshots: screenshotUrls },
    });

    return NextResponse.json({
      success: true,
      screenshots: screenshotUrls,
    });
  } catch (error) {
    console.error("Error generating screenshots:", error);
    return NextResponse.json(
      { error: "Failed to generate screenshots" },
      { status: 500 }
    );
  }
}
