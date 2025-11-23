import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { scrapeWebsite } from "@/lib/scraping/puppeteerService";
import { classifySite } from "@/lib/scraping/siteClassifier";
import { extractLogoColors } from "@/lib/colors/colorExtractor";

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
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Step 1: Scrape the website
    console.log(`Scraping website: ${url}`);
    const scrapedData = await scrapeWebsite(url);

    // Step 2: Classify site type and detect industry
    console.log("Classifying site...");
    const classification = classifySite(scrapedData);

    // Step 3: Extract logo colors (if logo exists)
    let logoColors: string[] = [];
    if (scrapedData.logo?.src) {
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
    console.log("Creating project in database...");
    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        url,
        siteType: classification.siteType,
        industry: classification.industry,
        scrapedContent: scrapedData as any,
        logoColors: logoColors,
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
