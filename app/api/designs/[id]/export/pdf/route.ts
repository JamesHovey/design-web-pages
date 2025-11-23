import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { generateDesignPDF } from "@/lib/export/pdfGenerator";

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

    // Prepare design data for PDF
    const designData = {
      name: design.name,
      description: design.description,
      rationale: design.rationale,
      ctaStrategy: design.ctaStrategy,
      accessibilityScore: design.accessibilityScore,
      distinctivenessScore: design.distinctivenessScore,
      estimatedBuildTime: design.estimatedBuildTime,
      qualityStrengths: (design.qualityStrengths as string[]) || [],
      qualityIssues: (design.qualityIssues as string[]) || [],
      screenshots: (design.screenshots as Record<string, string>) || {},
      project: {
        url: design.project.url,
        industry: design.project.industry || "general",
        siteType: design.project.siteType,
      },
    };

    // Generate PDF
    const pdfBlob = await generateDesignPDF(designData);

    // Convert blob to buffer for Next.js response
    const buffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Return PDF as download
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${design.name.replace(/\s+/g, '-')}-Design-${design.project.url.replace(/https?:\/\//, '').replace(/\//g, '-')}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
