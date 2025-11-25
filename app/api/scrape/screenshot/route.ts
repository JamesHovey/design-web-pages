import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import Anthropic from "@anthropic-ai/sdk";
import sharp from "sharp";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
    const { url, screenshot } = body;

    if (!url || !screenshot) {
      return NextResponse.json(
        { error: "URL and screenshot are required" },
        { status: 400 }
      );
    }

    console.log(`[Screenshot Analysis] Analyzing screenshot for: ${url}`);

    // Extract base64 image data (remove data:image/...;base64, prefix)
    const base64Data = screenshot.split(',')[1] || screenshot;

    // Analyze screenshot using Claude Vision API
    console.log("[Screenshot Analysis] Calling Claude Vision API...");
    const visionResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: base64Data,
              },
            },
            {
              type: "text",
              text: `Analyze this website screenshot and extract the following information in JSON format:

{
  "title": "Website title or main heading",
  "siteType": "ecommerce" or "leadgen",
  "industry": "Industry category (e.g., Transportation, E-commerce, Healthcare, etc.)",
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "structure": {
    "hasHeader": true/false,
    "hasHero": true/false,
    "hasSections": true/false,
    "hasFooter": true/false,
    "navigation": ["Nav item 1", "Nav item 2", ...]
  },
  "content": {
    "heading": "Main headline text",
    "subheading": "Subheading or tagline",
    "ctaButtons": ["Button text 1", "Button text 2", ...],
    "description": "Brief description of the site's purpose and content"
  },
  "designPatterns": ["pattern1", "pattern2", ...],
  "hasLogo": true/false
}

Identify:
- The site type (is it selling products [ecommerce] or generating leads/inquiries [leadgen]?)
- Industry category
- Main color palette (extract 5 most prominent colors as hex codes)
- Page structure and navigation items
- Key content and CTAs
- Design patterns used (e.g., "hero banner", "card grid", "testimonials", "product showcase", etc.)

Return ONLY valid JSON, no additional text.`,
            },
          ],
        },
      ],
    });

    // Parse Claude's response
    const analysisText = visionResponse.content[0].type === 'text'
      ? visionResponse.content[0].text
      : '';

    console.log("[Screenshot Analysis] Claude response:", analysisText);

    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from AI response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Create structured scraped data from analysis
    const scrapedData = {
      url,
      title: analysis.title || '',
      content: analysis.content?.description || '',
      structure: {
        header: analysis.structure?.hasHeader ? 'Header present' : '',
        navigation: analysis.structure?.navigation || [],
        sections: analysis.designPatterns || [],
        footer: analysis.structure?.hasFooter ? 'Footer present' : '',
      },
      images: [],
      forms: [],
      buttons: analysis.content?.ctaButtons?.map((text: string) => ({ text, href: '' })) || [],
      logo: analysis.hasLogo ? { src: '', alt: 'Logo detected' } : undefined,
    };

    // Create project in database
    console.log("[Screenshot Analysis] Creating project in database...");
    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        url,
        siteType: analysis.siteType || 'leadgen',
        industry: analysis.industry || 'Unknown',
        scrapedContent: scrapedData as any,
        screenshot: screenshot, // Store the screenshot
        logoColors: analysis.colors || [],
        viewports: ["desktop", "laptop", "tablet-portrait", "mobile-portrait"],
        colorScheme: {
          colors: analysis.colors || [],
          harmony: "complementary",
          extractFromLogo: false,
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

    console.log("[Screenshot Analysis] Project created successfully:", project.id);

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        url: project.url,
        siteType: project.siteType,
        industry: project.industry,
        logoColors: analysis.colors || [],
        analysis: {
          method: 'screenshot',
          designPatterns: analysis.designPatterns,
          structure: analysis.structure,
        },
      },
    });
  } catch (error) {
    console.error("[Screenshot Analysis] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze screenshot",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
