import type { Project } from "@prisma/client";

export interface DesignVariation {
  name: "Conservative" | "Balanced" | "Bold";
  description: string;
  widgetStructure: any;
  rationale: string;
  ctaStrategy: string;
  designDecisions: {
    layoutApproach: string;
    colorStrategy: string;
    typographyScale: string;
    spacingSystem: string;
    asymmetry: string;
  };
}

/**
 * Generate 3 design variations using Claude Sonnet 4.5
 * Applies critical design principles to avoid generic AI patterns
 */
export async function generateDesignVariations(
  project: any
): Promise<DesignVariation[]> {
  const systemPrompt = `You are an expert website designer creating DISTINCTIVE, production-grade designs.

CRITICAL DESIGN PRINCIPLES (YOU MUST FOLLOW):
1. ❌ AVOID: Centered everything, three-column grids, uniform padding, generic CTAs, cookie-cutter layouts
2. ✅ USE: Asymmetric layouts (70/30, 60/40 splits), varied spacing (40px-160px), dramatic typography scales
3. ✅ Industry personality: ${project.industry || "general"} sites need specific visual language
4. ✅ Strategic color: Use gradients, overlays, and unexpected color combinations from palette
5. ✅ WCAG AA minimum (AAA preferred): Ensure all text has sufficient contrast
6. ✅ Specific content: Write real, meaningful copy - NO "Lorem ipsum" or generic phrases

WIDGET STRUCTURE RULES:
- Use only widgets from the selected list: ${JSON.stringify(project.layoutWidgets)}
- Character limits for headings: H1 max 50, H2 max 60, H3 max 70, H4 max 80
- Include global-header and global-footer (always required)
- Apply industry-specific imagery and content themes

DESIGN VARIATIONS:
1. Conservative: Professional, trustworthy, safe - but STILL distinctive (not boring!)
2. Balanced: Modern, engaging, strategic - the sweet spot
3. Bold: Dramatic, eye-catching, memorable - push boundaries

JSON FORMAT REQUIREMENTS:
- Return ONLY valid JSON - no trailing commas, no comments, no markdown code blocks
- Ensure all quotes in text content are properly escaped
- Double-check JSON syntax before responding
- The response must be parseable by JSON.parse()

Return JSON array with 3 design variations.`;

  const userPrompt = `Generate 3 distinctive website design variations for:

PROJECT DETAILS:
- URL: ${project.url}
- Industry: ${project.industry || "general"}
- Site Type: ${project.siteType}
- Selected Viewports: ${JSON.stringify(project.viewports)}

CONFIGURATION:
- Colors: ${JSON.stringify(project.colorScheme)}
- Fonts: ${JSON.stringify(project.fonts)}
- Available Widgets: ${JSON.stringify(project.layoutWidgets)}

SCRAPED CONTENT (use as inspiration):
${JSON.stringify(project.scrapedContent).substring(0, 2000)}

COMPETITOR INSIGHTS (differentiate from these):
${JSON.stringify(project.competitors).substring(0, 1500)}

MEDIA ASSETS AVAILABLE:
${JSON.stringify(project.media || []).substring(0, 500)}

For each variation, provide:
{
  "name": "Conservative" | "Balanced" | "Bold",
  "description": "Brief description of design approach",
  "widgetStructure": {
    "sections": [
      {
        "sectionId": "hero",
        "layout": "asymmetric-70-30",
        "spacing": { "top": 120, "bottom": 160 },
        "widgets": [
          {
            "type": "heading",
            "level": "h1",
            "text": "Specific compelling headline (max 50 chars)",
            "fontSize": 72,
            "fontFamily": "from config",
            "position": "left",
            "width": "70%"
          },
          {
            "type": "button",
            "text": "Specific CTA (not 'Learn More')",
            "style": "primary",
            "position": "left"
          }
        ]
      }
    ],
    "globalHeader": { ... },
    "globalFooter": { ... }
  },
  "rationale": "Why this design works for this industry/audience",
  "ctaStrategy": "How CTAs are positioned for conversion",
  "designDecisions": {
    "layoutApproach": "Specific layout strategy",
    "colorStrategy": "How colors create hierarchy",
    "typographyScale": "Font size progression",
    "spacingSystem": "Rhythm and white space",
    "asymmetry": "How asymmetry creates interest"
  }
}

IMPORTANT: Return ONLY a valid JSON array of exactly 3 variations (no markdown, no code blocks, no explanatory text).
Ensure JSON is properly formatted with NO trailing commas, NO comments, and all strings properly escaped.
Verify your JSON is valid before responding. Each variation must be DISTINCTLY different from the others.`;

  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 16384, // Increased from 8192 to prevent cutoff
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  // Extract JSON from response
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("Claude response:", responseText.substring(0, 500));
    throw new Error("Failed to find JSON array in Claude response");
  }

  let jsonString = jsonMatch[0];

  // Attempt to repair common JSON issues
  jsonString = repairJSON(jsonString);

  let variations: DesignVariation[];
  try {
    variations = JSON.parse(jsonString);
  } catch (parseError) {
    // If parsing fails, provide detailed error info
    console.error("JSON parse error:", parseError);
    console.error("Failed JSON (first 1000 chars):", jsonString.substring(0, 1000));
    console.error("Failed JSON (last 1000 chars):", jsonString.substring(jsonString.length - 1000));

    throw new Error(
      `JSON parsing failed: ${parseError instanceof Error ? parseError.message : "Unknown error"}. ` +
      `Response length: ${jsonString.length} chars. Check logs for details.`
    );
  }

  // Validate we got 3 variations
  if (!Array.isArray(variations) || variations.length !== 3) {
    throw new Error(`Expected 3 variations, got ${variations?.length || 0}`);
  }

  return variations;
}

/**
 * Repair common JSON syntax errors
 */
function repairJSON(jsonString: string): string {
  let repaired = jsonString;

  // Remove trailing commas before closing brackets/braces
  repaired = repaired.replace(/,(\s*[\]}])/g, '$1');

  // Fix common quote escaping issues in text content
  // This is a simple approach - may need more sophisticated handling
  repaired = repaired.replace(/([^\\])"([^"]*)":/g, (match, before, content) => {
    // If this looks like a property name, keep it
    return match;
  });

  return repaired;
}

/**
 * Helper function to get Anthropic client (for direct import)
 */
function getAnthropicClient() {
  const Anthropic = require("@anthropic-ai/sdk").default;

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}
