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
  const systemPrompt = `You are an expert website designer creating PROFESSIONAL, PRODUCTION-GRADE GLOBAL HEADERS for Elementor websites.

CURRENT FOCUS: GLOBAL HEADER ONLY
- We are building incrementally - headers FIRST, then body sections later
- Generate ONLY the global header structure
- No body content, no hero sections, no features - JUST the header

CRITICAL HEADER DESIGN PRINCIPLES:
1. ✅ Professional styling: Match the quality of professional Elementor themes (like ThemeForest)
2. ✅ Industry-appropriate: ${project.industry || "general"} sites need specific visual language
3. ✅ Strategic layout: Logo placement, navigation hierarchy, CTA visibility
4. ✅ Professional patterns: Use 8px spacing grid, subtle shadows, smooth transitions
5. ✅ Smart widget selection: Choose header widgets intelligently based on site type and industry
6. ✅ Specific content: Write real menu items and contact info - NO "Lorem ipsum"

HEADER WIDGET SCHEMA (Elementor):
Use ONLY these widgets for the global header:

- site-logo: { type: "site-logo", imageUrl?: string, width?: number, height?: number, alt?: string }
- nav-menu: { type: "nav-menu", items: [{text: string, link?: string}], style?: "horizontal"|"vertical", alignment?: "left"|"center"|"right" }
- search: { type: "search", style: "icon"|"input-box", placeholder?: string }
- icon-box: { type: "icon-box", icon: "phone"|"email"|"location"|"chat", text: string, alignment?: "left"|"center"|"right" }
- button: { type: "button", text: string, link?: string, size?: "sm"|"md"|"lg", style?: "primary"|"secondary"|"outline" }
- cart-icon: { type: "cart-icon", itemCount?: number }

GLOBAL HEADER CONFIGURATION:
User has configured these header options:
${JSON.stringify(project.globalHeaderConfig || {})}

HEADER DESIGN RULES:
1. Choose widgets intelligently based on:
   - Site type: ${project.siteType} (ecommerce sites should include cart-icon)
   - Industry: ${project.industry || "general"} (service businesses should include icon-box with phone)
   - User configuration: Respect the globalHeaderConfig settings
2. Professional layout patterns:
   - Standard: Logo left, nav center, CTA right
   - Classic: Logo left, nav right, search/contact icons far right
   - Modern: Centered logo, nav below or split navigation
3. Use the configured menu items: ${JSON.stringify(project.globalHeaderConfig?.menuItems || ["Home", "About", "Services", "Contact"])}
4. Apply professional design patterns:
   - 8px spacing grid (8px, 16px, 24px, 32px)
   - Shadow: 2px 2px 6px 0 rgba(0,0,0,0.3)
   - Transitions: 0.35s ease-out
   - Professional typography and color hierarchy

DESIGN VARIATIONS:
1. Conservative: Professional, trustworthy, safe - but STILL distinctive (not boring!)
2. Balanced: Modern, engaging, strategic - the sweet spot
3. Bold: Dramatic, eye-catching, memorable - push boundaries

JSON FORMAT REQUIREMENTS:
- Return ONLY valid JSON - no trailing commas, no comments, no markdown code blocks
- Ensure all quotes in text content are properly escaped
- Double-check JSON syntax before responding
- The response must be parseable by JSON.parse()
- All widget properties must match Elementor schema specifications

Return JSON array with 3 design variations.`;

  const userPrompt = `Generate 3 distinctive GLOBAL HEADER designs for:

PROJECT DETAILS:
- URL: ${project.url}
- Industry: ${project.industry || "general"}
- Site Type: ${project.siteType}

CONFIGURATION:
- Colors: ${JSON.stringify(project.colorScheme)}
- Fonts: ${JSON.stringify(project.fonts)}
- Header Config: ${JSON.stringify(project.globalHeaderConfig)}

SCRAPED CONTENT (brand info):
${JSON.stringify(project.scrapedContent).substring(0, 1000)}

IMPORTANT: Generate ONLY the global header - NO body sections, NO hero, NO features.
Focus on creating 3 professional header variations that differ in layout and style.

For each variation, provide:
{
  "name": "Conservative" | "Balanced" | "Bold",
  "description": "Brief description of header design approach",
  "widgetStructure": {
    "globalHeader": {
      "layout": "standard"|"classic"|"modern",
      "height": number (60-100px typical),
      "backgroundColor": string,
      "sticky": boolean,
      "widgets": [
        {
          "type": "site-logo",
          "imageUrl": null,
          "alt": "${project.url} logo",
          "width": 180,
          "position": "left"
        },
        {
          "type": "nav-menu",
          "items": [${JSON.stringify((project.globalHeaderConfig as any)?.menuItems || ["Home", "About", "Services", "Contact"])}],
          "style": "horizontal",
          "alignment": "center"|"left"|"right"
        },
        {
          "type": "button",
          "text": "Specific CTA based on industry",
          "style": "primary"|"outline",
          "size": "md",
          "position": "right"
        }
        // Add other widgets based on globalHeaderConfig and site type
      ]
    }
  },
  "rationale": "Why this header layout works for this industry",
  "ctaStrategy": "What CTA is used in header and why",
  "designDecisions": {
    "layoutApproach": "Header layout pattern and widget arrangement",
    "colorStrategy": "Header background, text colors, CTA colors",
    "typographyScale": "Logo and nav menu font sizes",
    "spacingSystem": "Internal header spacing (8px grid)",
    "stickyBehavior": "Sticky header on scroll or static"
  }
}

IMPORTANT:
- Return ONLY a valid JSON array of exactly 3 header variations (no markdown, no code blocks)
- NO body content - ONLY globalHeader structure
- Choose header widgets intelligently based on site type and globalHeaderConfig
- Each variation should have a different layout pattern
- Ensure all JSON is properly formatted with NO trailing commas
- Each header must be DISTINCTLY different in layout and style`;

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
