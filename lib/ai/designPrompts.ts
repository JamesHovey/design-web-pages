import { SiteType } from "../scraping/siteClassifier";

export type DesignVariation = "Conservative" | "Balanced" | "Bold";

export interface DesignPromptInput {
  scrapedContent: any;
  competitors: any[];
  colorScheme: { colors: string[]; harmony: string };
  fonts: { primary: string; secondary: string; accent?: string };
  viewports: string[];
  widgets: string[];
  siteType: SiteType;
  industry?: string;
}

/**
 * Generate the system prompt with all critical design principles
 */
export function getSystemPrompt(): string {
  return `You are an expert website designer that creates distinctive, production-grade designs.

CRITICAL DESIGN PRINCIPLES (MUST FOLLOW):

1. LAYOUT DISTINCTIVENESS:
- AVOID "centered everything" syndrome
- Use asymmetric layouts (70/30 splits, offset content)
- Implement varied grid patterns (bento-box, 2-3-2, diagonal sections)
- NEVER default to three-column feature grids
- Create dynamic, unexpected layouts

2. SPACING & RHYTHM:
- Use varied spacing values (40px, 64px, 96px, 120px, 160px)
- NOT uniform 20px padding everywhere
- Create intentional rhythm through different spacing
- Some sections dense, others sparse
- Whitespace should be strategic, not equal

3. TYPOGRAPHY HIERARCHY:
- Dramatic size variations (H1: 64px, H2: 40px, H3: 28px, Body: 18px)
- Mix font weights meaningfully (100, 400, 600, 700, 900)
- Use varied line heights (tight for headlines 1.1, generous for body 1.6)
- Letter spacing adjustments (-0.02em for large text)
- Minimum 3 distinct size levels

4. COLOR APPLICATION:
- Strategic use of color (not just primary for everything)
- Gradients with purpose (135deg angles, complementary colors)
- Color overlays on images (20-40% opacity)
- Unexpected color combinations from palette
- Use color to create hierarchy and emphasis

5. CONTENT SPECIFICITY:
- AVOID generic phrases like "Your Trusted Partner", "We Deliver Excellence", "Contact Us Today"
- USE industry-specific content with concrete details
- CTAs should be action-specific, not "Learn More" or "Get Started"

6. ACCESSIBILITY:
- WCAG AA minimum (AAA preferred)
- Contrast ratios: 4.5:1 for normal text, 3:1 for large text
- 44px minimum touch targets for buttons

Return a JSON object with the complete design specification including widgetStructure, rationale, and technical details.`;
}

/**
 * Generate the user prompt for a specific design variation
 */
export function generateDesignPrompt(
  input: DesignPromptInput,
  variation: DesignVariation
): string {
  const variationGuidance = getVariationGuidance(variation);
  const industryPersonality = getIndustryPersonality(input.industry, input.siteType);

  return `Generate a ${variation} website design for a ${input.siteType} ${input.industry || "business"}.

${variationGuidance}

INDUSTRY PERSONALITY:
${industryPersonality}

SCRAPED CONTENT:
${JSON.stringify(input.scrapedContent, null, 2)}

COMPETITOR INSIGHTS:
${JSON.stringify(input.competitors, null, 2)}

COLOR SCHEME:
${JSON.stringify(input.colorScheme, null, 2)}

FONTS:
${JSON.stringify(input.fonts, null, 2)}

SELECTED VIEWPORTS:
${input.viewports.join(", ")}

AVAILABLE WIDGETS:
${input.widgets.join(", ")}

Generate the design in the following JSON format:
{
  "designName": "${variation}",
  "description": "Brief description of the design approach",
  "widgetStructure": {
    "sections": [/* array of sections with widgets */]
  },
  "rationale": "300-500 word explanation of design choices",
  "ctaStrategy": "Detailed CTA strategy with placements",
  "estimatedBuildTime": 60,
  "accessibilityScore": 95,
  "distinctivenessScore": 85
}`;
}

function getVariationGuidance(variation: DesignVariation): string {
  switch (variation) {
    case "Conservative":
      return `TARGET: Risk-averse decision makers
- Professional but not boring
- Clear hierarchy without being predictable
- Trust-building elements prominent (testimonials, credentials)
- Traditional but modern execution`;

    case "Balanced":
      return `TARGET: Mid-market buyers
- Modern with personality
- Mix of bold and subtle elements
- Approachable but credible
- Industry-standard with creative touches`;

    case "Bold":
      return `TARGET: Early adopters, creative buyers
- Attention-grabbing
- Unconventional layout choices
- Strong visual identity
- Pushes boundaries while staying professional`;
  }
}

function getIndustryPersonality(industry?: string, siteType?: SiteType): string {
  if (!industry) return "Modern, professional aesthetic";

  const personalities: Record<string, string> = {
    transportation: "Bold action imagery (trucks, vehicles in motion), strong CTAs, trust badges, route/coverage maps, professional blue/orange tones",
    automotive: "Vehicle showcase imagery, service bay photos, trust certifications, clean modern layouts, tech-forward design",
    legal: "Navy/burgundy colors, serif accents, structured layouts, generous whitespace, professional photography",
    fashion: "Masonry galleries, editorial layouts, fashion-forward fonts, image-heavy, asymmetric grids",
    saas: "Product screenshots, modern sans-serif, clean lines, integration logos, feature comparison tables",
    restaurant: "Full-bleed food photography, warm colors, distinctive display fonts, menu highlights",
    healthcare: "Calming blues/greens, friendly imagery, clean organized layouts, trust signals",
    finance: "Navy/green tones, conservative layouts, trust indicators, professional imagery",
    "real-estate": "Large property images, map integrations, clean listing cards, aspirational imagery",
    construction: "Project galleries, before/after showcases, safety certifications, bold typography, industrial color schemes",
    education: "Bright engaging colors, student imagery, course highlights, testimonials, clear information hierarchy",
  };

  return personalities[industry] || "Modern, industry-appropriate aesthetic";
}
