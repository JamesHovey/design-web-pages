import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { scrapeWebsiteHybrid } from "@/lib/scraping/hybridScraper";
import { classifySite } from "@/lib/scraping/siteClassifier";
import { extractLogoColors } from "@/lib/colors/colorExtractor";
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

    // Step 3.5: Auto-populate media assets based on industry
    let mediaAssets: any[] = [];
    if (classification.industry) {
      try {
        console.log(`Auto-populating media for industry: ${classification.industry}`);
        const mediaResult = await autoPopulateMedia(classification.industry);

        if (mediaResult.success) {
          mediaAssets = mediaResult.media;
          console.log(`✓ Auto-populated ${mediaAssets.length} media assets (${mediaResult.searchQuery})`);
        } else {
          console.warn(`⚠ Failed to auto-populate media: ${mediaResult.error}`);
        }
      } catch (error) {
        console.error("Error auto-populating media:", error);
        // Continue without auto-populated media
      }
    }

    // Step 4: Create project in database
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
        media: mediaAssets, // Include auto-populated media
        // Default configuration values
        viewports: ["desktop", "laptop", "tablet-portrait", "mobile-portrait"],
        colorScheme: {
          colors: logoColors.length > 0 ? logoColors : [],
          harmony: "complementary",
          extractFromLogo: logoColors.length > 0,
        },
        fonts: {
          primary: "",
          secondary: "",
          accent: "",
          button: "",
          form: "",
          nav: "",
        },
        layoutWidgets: [
          "global-header",
          "global-footer",
          "hero-banner",
        ],
        status: "configuring",
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
