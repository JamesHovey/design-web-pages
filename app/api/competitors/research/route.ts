import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { anthropic } from "@/lib/ai/claude";
import { prisma } from "@/lib/db/prisma";
import { scrapeWebsite } from "@/lib/scraping/puppeteerService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId, competitorUrls } = await request.json();

    if (!projectId || !competitorUrls || !Array.isArray(competitorUrls)) {
      return NextResponse.json(
        { error: "Invalid request. Provide projectId and competitorUrls array" },
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

    const competitorData: any[] = [];

    // Scrape and analyze each competitor
    for (const url of competitorUrls.slice(0, 5)) { // Limit to 5 competitors
      try {
        // Extract domain from URL for caching
        const domain = new URL(url).hostname.replace(/^www\./, '');

        // Check cache first (7-day TTL)
        const cached = await prisma.competitorCache.findFirst({
          where: {
            domain,
            expiresAt: {
              gte: new Date(),
            },
          },
        });

        if (cached) {
          competitorData.push(cached.analysis);
          continue;
        }

        // Scrape competitor website
        const scrapedData = await scrapeWebsite(url);

        // Use Claude to analyze competitor design
        const analysisPrompt = `Analyze this competitor website and provide design insights:

Website: ${url}
Content Summary: ${JSON.stringify(scrapedData).substring(0, 3000)}

Provide a JSON analysis with:
1. designStyle: Overall design approach (modern, minimal, bold, corporate, etc.)
2. colorPalette: Main colors used
3. typography: Font choices and hierarchy
4. layoutApproach: Layout patterns (grid, asymmetric, full-width, etc.)
5. uniqueFeatures: Standout design elements
6. strengths: What works well
7. weaknesses: Design gaps or opportunities
8. recommendations: How to differentiate from this competitor

Return ONLY valid JSON.`;

        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 2048,
          messages: [
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
        });

        const analysisText = message.content[0].type === 'text' ? message.content[0].text : '';
        let analysis;

        try {
          // Extract JSON from response
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
            designStyle: "Unable to analyze",
            error: "Failed to parse analysis"
          };
        } catch (e) {
          analysis = {
            designStyle: "Unable to analyze",
            error: "Failed to parse analysis"
          };
        }

        const competitorAnalysis = {
          url,
          scrapedData,
          analysis,
        };

        competitorData.push(competitorAnalysis);

        // Cache the analysis (7-day expiry)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.competitorCache.create({
          data: {
            domain,
            industry: project.industry || "general",
            analysis: competitorAnalysis as any,
            expiresAt,
          },
        });
      } catch (error) {
        console.error(`Error analyzing competitor ${url}:`, error);
        competitorData.push({
          url,
          error: "Failed to analyze competitor",
        });
      }
    }

    // Update project with competitor data
    await prisma.project.update({
      where: { id: projectId },
      data: {
        competitors: competitorData,
      },
    });

    return NextResponse.json({
      success: true,
      competitors: competitorData,
    });
  } catch (error) {
    console.error("Error in competitor research:", error);
    return NextResponse.json(
      { error: "Failed to research competitors" },
      { status: 500 }
    );
  }
}
