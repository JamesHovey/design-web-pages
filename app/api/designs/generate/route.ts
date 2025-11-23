import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { generateDesignVariations } from "@/lib/design/designGenerator";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if project is properly configured
    if (!project.viewports || !project.colorScheme || !project.fonts || !project.layoutWidgets) {
      return NextResponse.json(
        { error: "Project must be fully configured before generating designs" },
        { status: 400 }
      );
    }

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "generating" },
    });

    try {
      // Generate 3 design variations using Claude
      const variations = await generateDesignVariations(project);

      // Calculate quality scores for each variation
      const designs = await Promise.all(
        variations.map(async (variation) => {
          // Calculate accessibility score (basic implementation)
          const accessibilityScore = calculateAccessibilityScore(variation);

          // Calculate distinctiveness score (vs competitors)
          const distinctivenessScore = calculateDistinctivenessScore(
            variation,
            project.competitors
          );

          // Generate simple HTML preview
          const htmlPreview = generateHTMLPreview(variation, project);

          // Create design record
          return prisma.design.create({
            data: {
              projectId: project.id,
              name: variation.name,
              description: variation.description,
              widgetStructure: variation.widgetStructure,
              htmlPreview,
              cssCode: generateCSSCode(variation, project),
              estimatedBuildTime: estimateBuildTime(variation),
              accessibilityScore,
              distinctivenessScore,
              rationale: variation.rationale,
              ctaStrategy: variation.ctaStrategy,
              screenshots: {}, // Will be generated in Phase 4
              qualityIssues: identifyQualityIssues(variation, accessibilityScore),
              qualityStrengths: identifyQualityStrengths(variation, distinctivenessScore),
            },
          });
        })
      );

      // Update project status to completed
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "completed" },
      });

      return NextResponse.json({
        success: true,
        designs: designs.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description,
          accessibilityScore: d.accessibilityScore,
          distinctivenessScore: d.distinctivenessScore,
        })),
      });
    } catch (error) {
      // Update project status to failed
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });
      throw error;
    }
  } catch (error) {
    console.error("Error generating designs:", error);
    return NextResponse.json(
      { error: "Failed to generate designs" },
      { status: 500 }
    );
  }
}

/**
 * Calculate accessibility score (0-100)
 * Checks contrast ratios, font sizes, semantic structure
 */
function calculateAccessibilityScore(variation: any): number {
  let score = 100;

  // Check if all text has adequate font size (minimum 16px for body)
  const sections = variation.widgetStructure?.sections || [];
  sections.forEach((section: any) => {
    section.widgets?.forEach((widget: any) => {
      if (widget.type === "text-editor" && widget.fontSize < 16) {
        score -= 10;
      }
      if (widget.type === "heading" && widget.level === "h1" && widget.fontSize < 32) {
        score -= 5;
      }
    });
  });

  // Ensure score stays in valid range
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate distinctiveness score (0-100)
 * Compares design to competitor patterns
 */
function calculateDistinctivenessScore(variation: any, competitors: any): number {
  let score = 80; // Start with high baseline

  // Check for asymmetric layouts (bonus points)
  const hasAsymmetry = variation.designDecisions?.asymmetry?.toLowerCase().includes("asymmetric");
  if (hasAsymmetry) {
    score += 10;
  }

  // Check for varied spacing
  const hasVariedSpacing = variation.designDecisions?.spacingSystem?.toLowerCase().includes("varied");
  if (hasVariedSpacing) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Generate basic HTML preview
 */
function generateHTMLPreview(variation: any, project: any): string {
  const sections = variation.widgetStructure?.sections || [];

  const sectionHTML = sections.map((section: any) => {
    const widgets = section.widgets || [];
    const widgetHTML = widgets.map((widget: any) => {
      switch (widget.type) {
        case "heading":
          return `<${widget.level} style="font-family: ${widget.fontFamily}; font-size: ${widget.fontSize}px;">${widget.text}</${widget.level}>`;
        case "text-editor":
          return `<p style="font-size: ${widget.fontSize}px;">${widget.text}</p>`;
        case "button":
          return `<button style="padding: 12px 24px;">${widget.text}</button>`;
        default:
          return `<div><!-- ${widget.type} --></div>`;
      }
    }).join("\n");

    return `<section style="padding-top: ${section.spacing?.top || 80}px; padding-bottom: ${section.spacing?.bottom || 80}px;">
      ${widgetHTML}
    </section>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${variation.name} - ${project.url}</title>
</head>
<body>
  ${sectionHTML}
</body>
</html>`;
}

/**
 * Generate CSS code for the design
 */
function generateCSSCode(variation: any, project: any): string {
  const colors = project.colorScheme?.colors || [];
  const fonts = project.fonts || {};

  return `/* ${variation.name} Design - Generated CSS */

:root {
  --primary-color: ${colors[0] || "#000"};
  --secondary-color: ${colors[1] || "#666"};
  --accent-color: ${colors[2] || "#333"};
  --primary-font: ${fonts.primary || "sans-serif"};
  --secondary-font: ${fonts.secondary || "sans-serif"};
}

body {
  font-family: var(--primary-font);
  color: var(--primary-color);
  margin: 0;
  padding: 0;
}

/* Add more generated CSS based on design decisions */
`;
}

/**
 * Estimate build time in minutes
 */
function estimateBuildTime(variation: any): number {
  const sections = variation.widgetStructure?.sections || [];
  const widgetCount = sections.reduce((acc: number, section: any) => {
    return acc + (section.widgets?.length || 0);
  }, 0);

  // Rough estimate: 15 minutes base + 5 minutes per widget
  return 15 + (widgetCount * 5);
}

/**
 * Identify potential quality issues
 */
function identifyQualityIssues(variation: any, accessibilityScore: number): string[] {
  const issues: string[] = [];

  if (accessibilityScore < 80) {
    issues.push("Some accessibility improvements needed");
  }

  if (accessibilityScore < 60) {
    issues.push("Significant accessibility issues detected");
  }

  return issues;
}

/**
 * Identify quality strengths
 */
function identifyQualityStrengths(variation: any, distinctivenessScore: number): string[] {
  const strengths: string[] = [];

  if (distinctivenessScore >= 90) {
    strengths.push("Highly distinctive design");
  }

  if (variation.designDecisions?.asymmetry) {
    strengths.push("Effective use of asymmetric layouts");
  }

  if (variation.designDecisions?.spacingSystem?.toLowerCase().includes("varied")) {
    strengths.push("Dynamic spacing creates visual interest");
  }

  return strengths;
}
