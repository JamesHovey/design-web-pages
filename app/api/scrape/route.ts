import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { scrapeWebsiteHybrid } from "@/lib/scraping/hybridScraper";
import { classifySite } from "@/lib/scraping/siteClassifier";
import { extractLogoColors } from "@/lib/colors/colorExtractor";
import { generateDesignVariations } from "@/lib/design/designGenerator";
import { generateGlobalHeaderHTML } from "@/lib/elementor/htmlGenerator";
import { analyzeAllVariations } from "@/lib/media/mediaAnalyzer";
import { autoPopulateMedia } from "@/lib/media/autoPopulate";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url);

      // Ensure protocol is http or https
      if (!['http:', 'https:'].includes(validatedUrl.protocol)) {
        return NextResponse.json(
          { error: "URL must use http or https protocol" },
          { status: 400 }
        );
      }
    } catch (urlError) {
      return NextResponse.json(
        {
          error: "Invalid URL format",
          message: urlError instanceof Error ? urlError.message : "Please enter a valid URL"
        },
        { status: 400 }
      );
    }

    // Step 1: Scrape the website using hybrid approach
    console.log(`Scraping website: ${validatedUrl.toString()}`);
    console.log(`Puppeteer executable path: ${process.env.PUPPETEER_EXECUTABLE_PATH || 'default'}`);
    const scrapeResult = await scrapeWebsiteHybrid(validatedUrl.toString());

    // Check if scraping failed and manual upload is needed
    if (!scrapeResult.success) {
      if (scrapeResult.needsManualUpload) {
        return NextResponse.json(
          {
            error: "Website blocked automated access",
            message: scrapeResult.error,
            needsManualUpload: true,
          },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          {
            error: "Failed to scrape website",
            message: scrapeResult.error,
          },
          { status: 500 }
        );
      }
    }

    const scrapedData = scrapeResult.data!;
    console.log(`[Scrape API] Scraping succeeded using method: ${scrapeResult.method}`);

    // Step 2: Classify site type and detect industry using Claude AI
    console.log("Classifying site...");
    const classification = await classifySite(scrapedData, validatedUrl.toString());

    // Step 3: Extract logo URL and colors (if logo exists)
    let logoUrl: string | null = null;
    let logoColors: string[] = [];
    if (scrapedData.logo?.src) {
      logoUrl = scrapedData.logo.src;
      try {
        console.log("Extracting logo colors...");
        const colors = await extractLogoColors(scrapedData.logo.src);
        logoColors = colors.map((c) => c.hex);
      } catch (error) {
        console.error("Failed to extract logo colors:", error);
        // Continue without logo colors
      }
    }

    // Step 4: Create project in database
    // NOTE: Auto-generation has been disabled. User will configure settings on the configure page.
    // Design generation only happens when user clicks "Generate Designs" button.
    console.log("Creating project in database...");
    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        url,
        siteType: classification.siteType,
        industry: classification.industry,
        industryDesignGuidance: classification.industryDesignGuidance,
        scrapedContent: scrapedData as any,
        logoUrl: logoUrl,
        logoColors: logoColors,
        media: [], // Media will be fetched after design generation
        // Default configuration values
        viewports: ["desktop", "laptop", "tablet-portrait", "mobile-portrait"],
        colorScheme: {
          colors: logoColors.length > 0 ? logoColors : ["#007bff", "#6c757d", "#28a745"],
          harmony: "complementary",
          extractFromLogo: logoColors.length > 0,
        },
        fonts: {
          primary: "'Inter', system-ui, -apple-system, sans-serif",
          secondary: "Georgia, serif",
          accent: "'Inter', system-ui, -apple-system, sans-serif",
          button: "'Inter', system-ui, -apple-system, sans-serif",
          form: "'Inter', system-ui, -apple-system, sans-serif",
          nav: "'Inter', system-ui, -apple-system, sans-serif",
        },
        layoutWidgets: [
          "global-header",
          "global-footer",
          "hero-banner",
        ],
        globalHeaderConfig: {
          siteLogo: true,
          mainMenu: true,
          menuItems: ["Home", "Services", "About", "Contact"],
          search: classification.siteType === "ecommerce",
          searchType: "icon",
          iconBox: classification.siteType === "leadgen",
          iconBoxIcon: "phone",
          iconBoxPhone: "",
          cartIcon: classification.siteType === "ecommerce",
        },
        status: "draft", // Set to draft - user will configure before generating designs
      },
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        url: project.url,
        siteType: project.siteType,
        industry: project.industry,
        logoUrl: project.logoUrl,
        logoColors,
        classification: {
          confidence: classification.confidence,
          conversionGoals: classification.conversionGoals,
        },
      },
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      {
        error: "Failed to scrape website",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
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
