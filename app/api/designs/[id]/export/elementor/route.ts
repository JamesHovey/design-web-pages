import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { createElementorDownload } from "@/lib/export/elementorExporter";

export async function GET(
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

    // Fetch the design with project details
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

    // Prepare design data for Elementor export
    const designData = {
      widgetStructure: design.widgetStructure,
      name: design.name,
      description: design.description,
    };

    // Generate Elementor JSON
    const jsonBlob = createElementorDownload(designData);

    // Convert blob to buffer for Next.js response
    const buffer = Buffer.from(await jsonBlob.arrayBuffer());

    // Return JSON as download
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${design.name.replace(/\s+/g, '-')}-Elementor-${design.project.url.replace(/https?:\/\//, '').replace(/\//g, '-')}.json"`,
      },
    });
  } catch (error) {
    console.error("Error generating Elementor JSON:", error);
    return NextResponse.json(
      { error: "Failed to generate Elementor JSON" },
      { status: 500 }
    );
  }
}
