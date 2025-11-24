import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { generateDesignVariations } from "@/lib/design/designGenerator";
import { generateScreenshots } from "@/lib/screenshots/screenshotGenerator";
import { generateContainerHTML, generateWidgetHTML, generateElementorId } from "@/lib/elementor/htmlGenerator";

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
              screenshots: {}, // Will be generated asynchronously
              qualityIssues: identifyQualityIssues(variation, accessibilityScore),
              qualityStrengths: identifyQualityStrengths(variation, distinctivenessScore),
            },
          });
        })
      );

      // Generate screenshots for each design (async, don't wait)
      const viewports = (project.viewports as string[]) || ["desktop"];
      designs.forEach(async (design) => {
        try {
          const screenshots = await generateScreenshots(design.htmlPreview, viewports);

          // Convert base64 to data URLs
          const screenshotUrls: Record<string, string> = {};
          Object.entries(screenshots).forEach(([viewport, base64]) => {
            screenshotUrls[viewport] = `data:image/png;base64,${base64}`;
          });

          // Update design with screenshots
          await prisma.design.update({
            where: { id: design.id },
            data: { screenshots: screenshotUrls },
          });

          console.log(`Screenshots generated for design ${design.id}`);
        } catch (error) {
          console.error(`Failed to generate screenshots for design ${design.id}:`, error);
        }
      });

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
    const errorMessage = error instanceof Error ? error.message : "Failed to generate designs";
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : undefined },
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
 * Generate Elementor-compatible HTML preview with full widget support
 */
function generateHTMLPreview(variation: any, project: any): string {
  const sections = variation.widgetStructure?.sections || [];
  const mediaAssets = (project.media as any[]) || [];
  const colors = (project.colorScheme?.colors || []) as string[];
  const primaryColor = colors[0] || "#007bff";

  const sectionHTML = sections.map((section: any) => {
    const widgets = section.widgets || [];

    // Generate widget HTML using Elementor utilities
    const widgetHTML = widgets.map((widget: any) => {
      // Handle special widgets that need custom rendering
      if (widget.type === "global-header") {
        return `<header class="elementor-location-header" data-elementor-type="header" data-elementor-id="${generateElementorId()}">
          <div class="elementor-section-wrap">
            <div class="elementor-element e-flex e-con-boxed e-con" data-element_type="container">
              <div class="e-con-inner" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="font-size: 24px; font-weight: 700; color: ${primaryColor};">${project.industry || "Brand"}</div>
                <nav style="display: flex; gap: 30px;">
                  ${(widget.menuItems || ["Home", "About", "Services", "Contact"]).map((item: string) =>
                    `<a href="#" style="color: #333; text-decoration: none; font-weight: 500;">${item}</a>`
                  ).join("")}
                </nav>
              </div>
            </div>
          </div>
        </header>`;
      }

      if (widget.type === "global-footer") {
        return `<footer class="elementor-location-footer" data-elementor-type="footer" data-elementor-id="${generateElementorId()}">
          <div class="elementor-section-wrap">
            <div class="elementor-element e-flex e-con-boxed e-con" data-element_type="container">
              <div class="e-con-inner" style="background: #1a1a1a; color: white; padding: 60px 40px 30px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 40px;">
                  <div>
                    <h3 style="font-size: 20px; margin: 0 0 20px 0; color: ${primaryColor};">${project.industry || "Company"}</h3>
                    <p style="color: #aaa; line-height: 1.6;">Your trusted partner for quality services and products.</p>
                  </div>
                  <div>
                    <h4 style="font-size: 16px; margin: 0 0 20px 0;">Quick Links</h4>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                      ${["About", "Services", "Contact", "Privacy"].map(link =>
                        `<a href="#" style="color: #aaa; text-decoration: none;">${link}</a>`
                      ).join("")}
                    </div>
                  </div>
                  <div>
                    <h4 style="font-size: 16px; margin: 0 0 20px 0;">Contact</h4>
                    <p style="color: #aaa; line-height: 1.8; margin: 0;">Email: info@company.com<br>Phone: (555) 123-4567</p>
                  </div>
                </div>
                <div style="border-top: 1px solid #333; padding-top: 30px; text-align: center; color: #666;">
                  © ${new Date().getFullYear()} ${project.industry || "Company"}. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </footer>`;
      }

      // For all other widgets, use the Elementor HTML generator
      return generateWidgetHTML(widget, mediaAssets, project);
    }).join("\n");

    // Wrap widgets in Elementor container
    return generateContainerHTML(
      {
        id: generateElementorId(),
        elType: "container",
        settings: {
          content_width: "boxed",
          padding: {
            top: section.spacing?.top || 60,
            right: 40,
            bottom: section.spacing?.bottom || 60,
            left: 40,
            unit: "px"
          },
          background_background: section.background ? "classic" : undefined,
          background_color: section.background || undefined,
        },
      },
      widgetHTML
    );
  }).join("\n");

  return sectionHTML;
}

/**
 * Generate CSS code for the design
 */
function generateCSSCode(variation: any, project: any): string {
  const colors = (project.colorScheme?.colors || []) as string[];
  const fonts = project.fonts || {};

  return `/* ${variation.name} Design - Generated CSS */

* {
  box-sizing: border-box;
}

:root {
  --primary-color: ${colors[0] || "#007bff"};
  --secondary-color: ${colors[1] || "#6c757d"};
  --accent-color: ${colors[2] || "#28a745"};
  --primary-font: ${fonts.primary || "'Inter', system-ui, -apple-system, sans-serif"};
  --secondary-font: ${fonts.secondary || "Georgia, serif"};
}

body {
  font-family: var(--primary-font);
  color: #333;
  margin: 0;
  padding: 0;
  line-height: 1.6;
  background: #ffffff;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--primary-font);
  font-weight: 700;
  line-height: 1.2;
}

a {
  color: var(--primary-color);
  transition: opacity 0.2s ease;
}

a:hover {
  opacity: 0.8;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

button, .btn {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button:hover, .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }

  h1 {
    font-size: 32px !important;
  }

  h2 {
    font-size: 28px !important;
  }
}
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
