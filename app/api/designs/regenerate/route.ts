import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { generateDesignVariations } from "@/lib/design/designGenerator";
import { generateScreenshots } from "@/lib/screenshots/screenshotGenerator";
import { generateGlobalHeaderHTML } from "@/lib/elementor/htmlGenerator";
import { analyzeAllVariations } from "@/lib/media/mediaAnalyzer";
import { autoPopulateMedia } from "@/lib/media/autoPopulate";
import { getContrastSafeTextColor, getHeaderTextColor, getButtonColors, checkContrast } from "@/lib/colors/accessibilityChecker";

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
        { error: "Project must be fully configured before regenerating designs" },
        { status: 400 }
      );
    }

    console.log(`[Design Regeneration] Regenerating designs for project ${projectId}`);

    // Delete existing designs
    const deletedCount = await prisma.design.deleteMany({
      where: { projectId: project.id },
    });

    console.log(`[Design Regeneration] Deleted ${deletedCount.count} existing designs`);

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "generating" },
    });

    try {
      // Generate 3 NEW design variations using Claude
      // The reference mode will be read from project.referenceStyleMode
      const variations = await generateDesignVariations(project);

      console.log(`[Design Regeneration] Generated ${variations.length} new variations`);

      // INTELLIGENT MEDIA FETCHING: Analyze variations to determine media needs
      console.log("[Design Regeneration] Analyzing media requirements...");
      const mediaRequirements = analyzeAllVariations(variations);
      console.log(`[Design Regeneration] Media needed: ${mediaRequirements.images} images, ${mediaRequirements.videos} videos`);

      // Fetch media ONLY if widgets actually need it
      let mediaAssets: any[] = [];
      if (mediaRequirements.images > 0 || mediaRequirements.videos > 0) {
        console.log(`[Design Regeneration] Fetching media for industry: ${project.industry}`);
        const mediaResult = await autoPopulateMedia(project.industry || "general");

        if (mediaResult.success) {
          // Limit fetched media to what's actually needed
          const neededImages = mediaResult.media
            .filter((m: any) => m.type === "image")
            .slice(0, mediaRequirements.images);
          const neededVideos = mediaResult.media
            .filter((m: any) => m.type === "video")
            .slice(0, mediaRequirements.videos);

          mediaAssets = [...neededImages, ...neededVideos];
          console.log(`✓ Fetched ${neededImages.length} images and ${neededVideos.length} videos (only what's needed)`);

          // Update project with fetched media
          await prisma.project.update({
            where: { id: project.id },
            data: { media: mediaAssets },
          });
        } else {
          console.warn(`⚠ Media fetch failed: ${mediaResult.error}`);
        }
      } else {
        console.log("[Design Regeneration] No media widgets detected - skipping media fetch");
      }

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

      console.log(`[Design Regeneration] Created ${designs.length} new design records`);

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

      console.log(`[Design Regeneration] Successfully regenerated designs for project ${projectId}`);

      return NextResponse.json({
        success: true,
        message: "Designs regenerated successfully",
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
    console.error("Error regenerating designs:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to regenerate designs";
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
  let contrastChecks = 0;
  let contrastPasses = 0;

  // Check header contrast if present
  const globalHeader = variation.widgetStructure?.globalHeader;
  if (globalHeader?.backgroundColor) {
    const headerBg = globalHeader.backgroundColor;
    const headerTextColor = getHeaderTextColor(headerBg);

    // Check contrast ratio
    const contrast = checkContrast(headerTextColor, headerBg, false);

    contrastChecks++;
    if (contrast.passesAA) {
      contrastPasses++;
    } else {
      score -= 25; // Major penalty for failing header contrast
      console.warn(`Header contrast FAILS: ${headerTextColor} on ${headerBg} = ${contrast.ratio}:1`);
    }
  }

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

  // Bonus points for passing all contrast checks
  if (contrastChecks > 0 && contrastPasses === contrastChecks) {
    score += 10;
  }

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
 * Generate Elementor-compatible HTML preview - GLOBAL HEADER ONLY
 * This focuses exclusively on generating professional global headers
 */
function generateHTMLPreview(variation: any, project: any): string {
  // Extract globalHeader from the widget structure
  const globalHeader = variation.widgetStructure?.globalHeader;

  if (!globalHeader) {
    console.warn("No globalHeader found in variation:", variation.name);
    return `<!-- No global header defined for ${variation.name} -->`;
  }

  // Generate professional header HTML using the specialized generator
  const headerHTML = generateGlobalHeaderHTML(globalHeader, project.colorScheme);

  return headerHTML;
}

/**
 * Generate CSS code for the design WITH PROPER CONTRAST
 */
function generateCSSCode(variation: any, project: any): string {
  const colors = (project.colorScheme?.colors || []) as string[];
  const fonts = project.fonts || {};

  // Extract header background color
  const headerBg = variation.widgetStructure?.globalHeader?.backgroundColor || "#ffffff";

  // Calculate contrast-safe text colors
  const headerTextColor = getHeaderTextColor(headerBg);
  const bodyBgColor = "#ffffff";
  const bodyTextColor = getContrastSafeTextColor(bodyBgColor);

  // Check if header has outline buttons (S1.PNG style)
  const headerWidgets = variation.widgetStructure?.globalHeader?.widgets || [];
  const hasOutlineButton = headerWidgets.some((w: any) => w.type === "button" && w.style === "outline");
  const outlineButtonColor = headerWidgets.find((w: any) => w.type === "button" && w.style === "outline")?.customStyle?.border?.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/)?.[0] || "#00bcd4";

  // Get button colors with proper contrast
  const primaryBtnColors = hasOutlineButton
    ? { background: "transparent", text: headerTextColor, border: outlineButtonColor }
    : getButtonColors(colors[0] || "#007bff");

  return `/* ${variation.name} Design - Generated CSS with WCAG AA Contrast */

* {
  box-sizing: border-box;
}

:root {
  --primary-color: ${colors[0] || "#007bff"};
  --secondary-color: ${colors[1] || "#6c757d"};
  --accent-color: ${colors[2] || "#28a745"};
  --primary-font: ${fonts.primary || "'Inter', system-ui, -apple-system, sans-serif"};
  --secondary-font: ${fonts.secondary || "Georgia, serif"};

  /* CONTRAST-SAFE COLORS - WCAG AA Compliant */
  --header-bg: ${headerBg};
  --header-text: ${headerTextColor};
  --body-bg: ${bodyBgColor};
  --body-text: ${bodyTextColor};
  --button-bg: ${primaryBtnColors.background};
  --button-text: ${primaryBtnColors.text};
}

body {
  font-family: var(--primary-font);
  color: var(--body-text);
  margin: 0;
  padding: 0;
  line-height: 1.6;
  background: var(--body-bg);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--primary-font);
  font-weight: 700;
  line-height: 1.2;
  color: inherit;
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

/* PROFESSIONAL HEADER CONTRAST - Override hardcoded colors */
.elementor-location-header {
  background-color: var(--header-bg) !important;
  color: var(--header-text) !important;
}

.elementor-location-header * {
  color: var(--header-text) !important;
}

/* S1.PNG Style - Logo placeholder styling */
.elementor-location-header .elementor-site-logo-placeholder {
  background: transparent !important;
  color: var(--header-text) !important;
  box-shadow: none !important;
  font-size: 20px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
}

.elementor-location-header .elementor-nav-menu-link {
  color: var(--header-text) !important;
  font-size: 15px !important;
  font-weight: 400 !important;
  padding: 8px 16px !important;
}

.elementor-location-header .dt-nav-menu-horizontal {
  gap: 32px !important;
}

.elementor-location-header .elementor-button {
  ${hasOutlineButton ? `
  background-color: transparent !important;
  color: var(--header-text) !important;
  border: 2px solid ${outlineButtonColor} !important;
  border-radius: 24px !important;
  padding: 10px 28px !important;
  transition: all 0.3s ease !important;
  ` : `
  background-color: var(--button-bg) !important;
  color: var(--button-text) !important;
  `}
}

${hasOutlineButton ? `
.elementor-location-header .elementor-button:hover {
  background-color: ${outlineButtonColor} !important;
  color: #ffffff !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
}
` : ``}

.elementor-location-header .elementor-search-icon,
.elementor-location-header .elementor-cart-icon-link {
  color: var(--header-text) !important;
}

.elementor-location-header .header-icon-box-link {
  color: var(--header-text) !important;
}

.elementor-location-header .header-icon-box-text {
  color: var(--header-text) !important;
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
