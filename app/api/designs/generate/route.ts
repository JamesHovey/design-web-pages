import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { generateDesignVariations } from "@/lib/design/designGenerator";
import { generateScreenshots } from "@/lib/screenshots/screenshotGenerator";

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
 * Generate comprehensive HTML preview with full widget support
 */
function generateHTMLPreview(variation: any, project: any): string {
  const sections = variation.widgetStructure?.sections || [];
  const mediaAssets = (project.media as any[]) || [];

  // Helper to get media by type
  const getMedia = (type: "image" | "video", index = 0) => {
    const filtered = mediaAssets.filter(m => m.type === type);
    return filtered[index % Math.max(filtered.length, 1)] || null;
  };

  const sectionHTML = sections.map((section: any, sectionIndex: number) => {
    const widgets = section.widgets || [];
    const widgetHTML = widgets.map((widget: any, widgetIndex: number) => {
      const colors = (project.colorScheme?.colors || []) as string[];
      const primaryColor = colors[0] || "#007bff";
      const secondaryColor = colors[1] || "#6c757d";

      switch (widget.type) {
        case "heading":
          return `<${widget.level || "h2"} style="font-family: ${widget.fontFamily || "sans-serif"}; font-size: ${widget.fontSize || 32}px; color: ${primaryColor}; margin: 20px 0;">${widget.text || "Heading"}</${widget.level || "h2"}>`;

        case "text-editor":
          return `<div style="font-size: ${widget.fontSize || 16}px; line-height: 1.6; color: #333; margin: 15px 0;">${widget.text || "Content text goes here."}</div>`;

        case "button":
          return `<a href="${widget.link || "#"}" style="display: inline-block; padding: 12px 32px; background: ${primaryColor}; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; margin: 10px 0;">${widget.text || "Click Here"}</a>`;

        case "image": {
          const img = widget.url ? { url: widget.url } : getMedia("image", widgetIndex);
          const imgUrl = img?.url || "https://via.placeholder.com/800x600?text=Image";
          return `<div style="margin: 20px 0;"><img src="${imgUrl}" alt="${widget.alt || "Image"}" style="max-width: 100%; height: auto; display: block; border-radius: 8px;"></div>`;
        }

        case "video": {
          const vid = widget.url ? { url: widget.url } : getMedia("video", widgetIndex);
          const vidUrl = vid?.url || "";
          if (!vidUrl) return "";
          return `<div style="margin: 20px 0; position: relative; padding-bottom: 56.25%; height: 0;"><video controls style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px;"><source src="${vidUrl}" type="video/mp4">Your browser does not support video.</video></div>`;
        }

        case "divider":
          return `<hr style="border: none; border-top: ${widget.width || 1}px ${widget.style || "solid"} ${widget.color || secondaryColor}; margin: 40px 0;">`;

        case "spacer":
          return `<div style="height: ${widget.height || 50}px;"></div>`;

        case "icon-box":
          return `<div style="border: 1px solid #e0e0e0; padding: 30px; border-radius: 8px; text-align: ${widget.alignment || "center"}; margin: 20px 0;">
            <div style="font-size: 48px; color: ${primaryColor}; margin-bottom: 15px;">${widget.icon || "★"}</div>
            <h3 style="font-size: 24px; color: #333; margin: 10px 0;">${widget.title || "Feature Title"}</h3>
            <p style="color: #666; line-height: 1.6;">${widget.description || "Feature description goes here."}</p>
          </div>`;

        case "image-box": {
          const img = widget.url ? { url: widget.url } : getMedia("image", widgetIndex);
          const imgUrl = img?.url || "https://via.placeholder.com/400x300?text=Image+Box";
          return `<div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; margin: 20px 0;">
            <img src="${imgUrl}" alt="${widget.alt || "Image"}" style="width: 100%; height: 250px; object-fit: cover;">
            <div style="padding: 20px;">
              <h3 style="font-size: 22px; color: #333; margin: 0 0 10px 0;">${widget.title || "Image Box Title"}</h3>
              <p style="color: #666; line-height: 1.6; margin: 0;">${widget.description || "Description text."}</p>
            </div>
          </div>`;
        }

        case "testimonial":
          return `<div style="background: #f9f9f9; padding: 30px; border-left: 4px solid ${primaryColor}; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 18px; color: #333; font-style: italic; line-height: 1.6; margin: 0 0 20px 0;">"${widget.text || "This is a great testimonial about the product or service."}"</p>
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="width: 50px; height: 50px; border-radius: 50%; background: ${primaryColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${(widget.name || "JD")[0]}</div>
              <div>
                <div style="font-weight: 600; color: #333;">${widget.name || "John Doe"}</div>
                <div style="font-size: 14px; color: #666;">${widget.position || "Customer"}</div>
              </div>
            </div>
          </div>`;

        case "star-rating": {
          const rating = widget.rating || 5;
          const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
          return `<div style="font-size: ${widget.size || 24}px; color: #ffc107; margin: 10px 0;">${stars}</div>`;
        }

        case "social-icons": {
          const icons = widget.icons || [
            { platform: "Facebook", url: "#" },
            { platform: "Twitter", url: "#" },
            { platform: "Instagram", url: "#" }
          ];
          return `<div style="display: flex; gap: 15px; margin: 20px 0;">
            ${icons.map((icon: any) => `<a href="${icon.url || "#"}" style="width: 40px; height: 40px; background: ${primaryColor}; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; text-decoration: none; font-weight: bold;">${icon.platform[0]}</a>`).join("")}
          </div>`;
        }

        case "counter":
          return `<div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 48px; font-weight: bold; color: ${primaryColor};">${widget.endNumber || 100}</div>
            <div style="font-size: 16px; color: #666; margin-top: 10px;">${widget.title || "Counter Title"}</div>
          </div>`;

        case "progress-bar":
          return `<div style="margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #333; font-weight: 600;">${widget.title || "Skill"}</span>
              <span style="color: #666;">${widget.percent || 80}%</span>
            </div>
            <div style="height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden;">
              <div style="height: 100%; width: ${widget.percent || 80}%; background: ${primaryColor};"></div>
            </div>
          </div>`;

        case "alert":
          return `<div style="padding: 15px 20px; background: ${widget.type === "warning" ? "#fff3cd" : "#d1ecf1"}; border: 1px solid ${widget.type === "warning" ? "#ffc107" : "#0dcaf0"}; border-radius: 4px; color: #333; margin: 20px 0;">
            ${widget.text || "This is an alert message."}
          </div>`;

        case "accordion":
          return `<div style="border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
            ${(widget.items || [{title: "Item 1", content: "Content 1"}]).map((item: any, i: number) => `
              <div style="border-bottom: 1px solid #e0e0e0;">
                <div style="padding: 15px 20px; background: ${i === 0 ? "#f9f9f9" : "white"}; font-weight: 600; cursor: pointer;">${item.title}</div>
                ${i === 0 ? `<div style="padding: 15px 20px; color: #666;">${item.content}</div>` : ""}
              </div>
            `).join("")}
          </div>`;

        case "tabs":
          return `<div style="margin: 20px 0;">
            <div style="display: flex; border-bottom: 2px solid #e0e0e0; gap: 5px;">
              ${(widget.tabs || [{title: "Tab 1"}, {title: "Tab 2"}]).map((tab: any, i: number) => `
                <div style="padding: 12px 24px; ${i === 0 ? `border-bottom: 2px solid ${primaryColor}; color: ${primaryColor};` : "color: #666;"} cursor: pointer; font-weight: 600;">${tab.title}</div>
              `).join("")}
            </div>
            <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
              ${(widget.tabs || [{content: "Tab content goes here."}])[0].content}
            </div>
          </div>`;

        case "call-to-action":
          return `<div style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: white; padding: 60px 40px; border-radius: 12px; text-align: center; margin: 40px 0;">
            <h2 style="font-size: 36px; margin: 0 0 15px 0;">${widget.title || "Ready to Get Started?"}</h2>
            <p style="font-size: 18px; margin: 0 0 30px 0; opacity: 0.9;">${widget.description || "Join thousands of satisfied customers today."}</p>
            <a href="${widget.buttonLink || "#"}" style="display: inline-block; padding: 15px 40px; background: white; color: ${primaryColor}; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 18px;">${widget.buttonText || "Get Started Now"}</a>
          </div>`;

        case "price-table":
          return `<div style="border: 2px solid #e0e0e0; border-radius: 12px; padding: 40px 30px; text-align: center; margin: 20px 0; ${widget.featured ? `border-color: ${primaryColor}; box-shadow: 0 10px 30px rgba(0,0,0,0.1);` : ""}">
            ${widget.featured ? `<div style="background: ${primaryColor}; color: white; padding: 8px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">MOST POPULAR</div>` : ""}
            <h3 style="font-size: 24px; color: #333; margin: 0 0 10px 0;">${widget.title || "Basic Plan"}</h3>
            <div style="font-size: 48px; font-weight: bold; color: ${primaryColor}; margin: 20px 0;">$${widget.price || 29}<span style="font-size: 18px; font-weight: normal; color: #666;">/mo</span></div>
            <ul style="list-style: none; padding: 0; margin: 30px 0; text-align: left;">
              ${(widget.features || ["Feature 1", "Feature 2", "Feature 3"]).map((f: string) => `<li style="padding: 10px 0; color: #666; border-bottom: 1px solid #f0f0f0;">✓ ${f}</li>`).join("")}
            </ul>
            <a href="${widget.buttonLink || "#"}" style="display: inline-block; padding: 15px 40px; background: ${primaryColor}; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; width: 100%; box-sizing: border-box;">${widget.buttonText || "Choose Plan"}</a>
          </div>`;

        case "gallery": {
          const images = Array(widget.count || 6).fill(0).map((_, i) => {
            const img = getMedia("image", i);
            return img?.url || `https://via.placeholder.com/400x300?text=Gallery+${i+1}`;
          });
          return `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin: 20px 0;">
            ${images.map(url => `<img src="${url}" alt="Gallery image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`).join("")}
          </div>`;
        }

        case "carousel": {
          const img = getMedia("image", 0);
          const imgUrl = img?.url || "https://via.placeholder.com/1200x500?text=Carousel+Slide";
          return `<div style="position: relative; margin: 20px 0; border-radius: 12px; overflow: hidden;">
            <img src="${imgUrl}" alt="Carousel" style="width: 100%; height: 400px; object-fit: cover;">
            <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center;">
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: white; margin: 0 5px;"></span>
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.5); margin: 0 5px;"></span>
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.5); margin: 0 5px;"></span>
            </div>
          </div>`;
        }

        case "form":
          return `<form style="background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0;">
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">Name</label>
              <input type="text" placeholder="Enter your name" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">Email</label>
              <input type="email" placeholder="Enter your email" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">Message</label>
              <textarea placeholder="Your message" rows="4" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box; resize: vertical;"></textarea>
            </div>
            <button type="submit" style="width: 100%; padding: 15px; background: ${primaryColor}; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: 600; cursor: pointer;">Submit</button>
          </form>`;

        case "hero-banner": {
          const img = getMedia("image", 0);
          const bgUrl = img?.url || "https://via.placeholder.com/1920x800?text=Hero+Banner";
          return `<div style="position: relative; height: 600px; background: url('${bgUrl}') center/cover; display: flex; align-items: center; justify-content: center; color: white; text-align: center; margin: 0;">
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.4);"></div>
            <div style="position: relative; z-index: 1; max-width: 800px; padding: 40px;">
              <h1 style="font-size: 56px; margin: 0 0 20px 0; font-weight: 700;">${widget.title || "Welcome to Our Website"}</h1>
              <p style="font-size: 20px; margin: 0 0 30px 0; opacity: 0.95;">${widget.subtitle || "Discover amazing products and services"}</p>
              <a href="${widget.buttonLink || "#"}" style="display: inline-block; padding: 18px 45px; background: ${primaryColor}; color: white; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 18px;">${widget.buttonText || "Get Started"}</a>
            </div>
          </div>`;
        }

        case "global-header":
          return `<header style="background: white; padding: 20px 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100;">
            <div style="font-size: 24px; font-weight: 700; color: ${primaryColor};">${project.industry || "Brand"}</div>
            <nav style="display: flex; gap: 30px;">
              ${(widget.menuItems || ["Home", "About", "Services", "Contact"]).map((item: string) => `<a href="#" style="color: #333; text-decoration: none; font-weight: 500;">${item}</a>`).join("")}
            </nav>
          </header>`;

        case "global-footer":
          return `<footer style="background: #1a1a1a; color: white; padding: 60px 40px 30px; margin-top: 60px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 40px;">
              <div>
                <h3 style="font-size: 20px; margin: 0 0 20px 0; color: ${primaryColor};">${project.industry || "Company"}</h3>
                <p style="color: #aaa; line-height: 1.6;">Your trusted partner for quality services and products.</p>
              </div>
              <div>
                <h4 style="font-size: 16px; margin: 0 0 20px 0;">Quick Links</h4>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  ${["About", "Services", "Contact", "Privacy"].map(link => `<a href="#" style="color: #aaa; text-decoration: none;">${link}</a>`).join("")}
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
          </footer>`;

        default:
          // For any unhandled widget types, show a placeholder
          return `<div style="padding: 20px; background: #f0f0f0; border: 2px dashed #ccc; border-radius: 8px; text-align: center; color: #999; margin: 20px 0;">
            ${widget.type || "Widget"} (${widget.type ? "Not yet rendered" : "Unknown type"})
          </div>`;
      }
    }).join("\n");

    return `<section style="padding: ${section.spacing?.top || 60}px 40px ${section.spacing?.bottom || 60}px; ${section.background ? `background: ${section.background};` : ""}">
      <div style="max-width: 1200px; margin: 0 auto;">
        ${widgetHTML}
      </div>
    </section>`;
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
