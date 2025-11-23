import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

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

    // Fetch the design to verify ownership via project
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

    // Approve this design and un-approve others for this project
    await prisma.$transaction([
      // Un-approve all designs for this project
      prisma.design.updateMany({
        where: { projectId: design.projectId },
        data: { approved: false, approvedAt: null, approvedBy: null },
      }),
      // Approve the selected design
      prisma.design.update({
        where: { id: designId },
        data: {
          approved: true,
          approvedAt: new Date(),
          approvedBy: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Design approved successfully",
    });
  } catch (error) {
    console.error("Error approving design:", error);
    return NextResponse.json(
      { error: "Failed to approve design" },
      { status: 500 }
    );
  }
}
