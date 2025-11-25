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

${getIndustryHeaderGuidance(project.industry, project.siteType)}

HEADER WIDGET SCHEMA (Elementor):
Use ONLY these widgets for the global header:

- site-logo: { type: "site-logo", imageUrl: "${project.logoUrl || null}", width?: number, height?: number, alt?: string }
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
          "imageUrl": ${project.logoUrl ? `"${project.logoUrl}"` : "null"},
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
 * Get industry-specific header design guidance
 * Provides detailed header patterns, widget selection, and design approach per industry
 */
function getIndustryHeaderGuidance(industry?: string, siteType?: string): string {
  if (!industry) {
    return `\nGENERAL HEADER DESIGN:
- Use standard header pattern: Logo left, Navigation center/right, CTA button right
- Include all configured widgets from globalHeaderConfig
- Professional, clean layout appropriate for any business`;
  }

  const industryGuidance: Record<string, string> = {
    "vehicle-transport": `
INDUSTRY-SPECIFIC HEADER DESIGN FOR VEHICLE TRANSPORT:
✅ Layout Pattern: Logo left, Nav menu (Services, Fleet, Tracking, Contact), Phone icon-box with "24/7 Dispatch", CTA "Get Quote"
✅ Widget Selection: site-logo, nav-menu, icon-box (phone), button
✅ Menu Items: ["Home", "Services", "Fleet", "Track Shipment", "Get Quote", "Contact"]
✅ CTA Text: "Get Free Quote" or "Book Transport" (NOT "Get Started")
✅ Icon Box: Phone with actual dispatch number prominently displayed
✅ Colors: Blues (#003d82, #0066cc) and grays for trust and reliability
✅ Height: 80-90px for professional appearance
✅ Sticky: YES - users need access to contact info while scrolling`,

    "restaurant": `
INDUSTRY-SPECIFIC HEADER DESIGN FOR RESTAURANT:
✅ Layout Pattern: Logo left, Nav menu center, Phone icon-box + CTA "Reserve Table"
✅ Widget Selection: site-logo, nav-menu, icon-box (phone), button
✅ Menu Items: ["Menu", "Reservations", "Our Story", "Catering", "Contact", "Order Online"]
✅ CTA Text: "Reserve Table" or "Order Now" (NOT "Get Started")
✅ Icon Box: Phone for reservations
✅ Colors: Warm appetizing colors (reds #c41e3a, oranges #ff6b35, earth tones)
✅ Height: 70-80px, elegant but not overwhelming
✅ Sticky: YES - access to reservations while browsing menu`,

    "dental-practice": `
INDUSTRY-SPECIFIC HEADER DESIGN FOR DENTAL PRACTICE:
✅ Layout Pattern: Logo left, Nav center, Phone icon-box + CTA "Book Appointment"
✅ Widget Selection: site-logo, nav-menu, icon-box (phone), button
✅ Menu Items: ["Services", "New Patients", "Insurance", "About Dr. [Name]", "Contact"]
✅ CTA Text: "Book Appointment" or "Schedule Visit" (NOT "Get Started")
✅ Icon Box: Phone with practice number
✅ Colors: Calming blues (#4a90e2, #87ceeb) and clean whites for trust
✅ Height: 75-85px, professional medical appearance
✅ Sticky: YES - easy appointment booking access`,

    "law-firm": `
INDUSTRY-SPECIFIC HEADER DESIGN FOR LAW FIRM:
✅ Layout Pattern: Logo left, Nav right, Phone icon-box, CTA "Free Consultation"
✅ Widget Selection: site-logo, nav-menu, icon-box (phone), button
✅ Menu Items: ["Practice Areas", "Attorneys", "Case Results", "Testimonials", "Contact"]
✅ CTA Text: "Free Consultation" or "Speak to Attorney" (NOT "Get Started")
✅ Icon Box: Phone with office number
✅ Colors: Traditional authoritative (navy #1a365d, burgundy #722f37, gold accents)
✅ Height: 85-95px, substantial and professional
✅ Sticky: YES - prominent contact access`,

    "real-estate": `
INDUSTRY-SPECIFIC HEADER DESIGN FOR REAL ESTATE:
✅ Layout Pattern: Logo left, Nav center, Search icon, CTA "View Listings"
✅ Widget Selection: site-logo, nav-menu, search, button
✅ Menu Items: ["Buy", "Sell", "Rent", "Agents", "Neighborhoods", "Contact"]
✅ CTA Text: "View Listings" or "Schedule Showing" (NOT "Get Started")
✅ Search: Property search icon prominently displayed
✅ Colors: Professional modern (blues #2c5aa0, grays #6b7280, clean whites)
✅ Height: 75-85px, modern professional
✅ Sticky: YES - search and contact access while browsing`,

    "fitness": `
INDUSTRY-SPECIFIC HEADER DESIGN FOR FITNESS GYM:
✅ Layout Pattern: Logo left, Nav center, CTA "Start Free Trial"
✅ Widget Selection: site-logo, nav-menu, button
✅ Menu Items: ["Classes", "Trainers", "Memberships", "Schedule", "Join Now"]
✅ CTA Text: "Start Free Trial" or "Join Now" (NOT "Get Started")
✅ Colors: Energetic bold (red #e53e3e, orange #dd6b20, black #1a202c)
✅ Height: 70-80px, dynamic and bold
✅ Sticky: YES - easy class scheduling access`,

    "beauty-salon": `
INDUSTRY-SPECIFIC HEADER DESIGN FOR BEAUTY SALON/SPA:
✅ Layout Pattern: Logo center or left, Nav right, Phone icon-box, CTA "Book Now"
✅ Widget Selection: site-logo, nav-menu, icon-box (phone), button
✅ Menu Items: ["Services", "Stylists", "Gallery", "Products", "Book Online"]
✅ CTA Text: "Book Appointment" or "Book Now" (NOT "Get Started")
✅ Icon Box: Phone for appointments
✅ Colors: Elegant soft (rose gold #b76e79, soft pink #f7d7dc, cream #faf8f3)
✅ Height: 70-80px, elegant and refined
✅ Sticky: Optional - depends on aesthetic preference`,

    "home-services": `
INDUSTRY-SPECIFIC HEADER DESIGN FOR HOME SERVICES (Plumbing/HVAC/Electric):
✅ Layout Pattern: Logo left, Nav center, Phone icon-box (prominent), CTA "Emergency Service"
✅ Widget Selection: site-logo, nav-menu, icon-box (phone), button
✅ Menu Items: ["Services", "Emergency", "Service Areas", "About", "Contact"]
✅ CTA Text: "Call Now" or "24/7 Emergency" (NOT "Get Started")
✅ Icon Box: Large phone number for emergency calls
✅ Colors: Trust colors (blue #2563eb, orange #f97316 for urgency)
✅ Height: 80-90px, phone number needs prominence
✅ Sticky: YES - emergency contact must be always visible`,

    "photography": `
INDUSTRY-SPECIFIC HEADER DESIGN FOR PHOTOGRAPHY:
✅ Layout Pattern: Minimal - Logo left or center, minimal nav, CTA "View Portfolio"
✅ Widget Selection: site-logo, nav-menu (minimal), button
✅ Menu Items: ["Portfolio", "Services", "About", "Contact"] - KEEP IT MINIMAL
✅ CTA Text: "View Portfolio" or "Book Session" (NOT "Get Started")
✅ Colors: Minimalist (black #000000, white #ffffff, subtle accent)
✅ Height: 60-70px, minimal to showcase photography
✅ Sticky: Optional - depends on gallery scroll experience`,

    "insurance": `
INDUSTRY-SPECIFIC HEADER DESIGN FOR INSURANCE:
✅ Layout Pattern: Logo left, Nav center, Phone icon-box, CTA "Get Quote"
✅ Widget Selection: site-logo, nav-menu, icon-box (phone), button
✅ Menu Items: ["Insurance Types", "Get Quote", "Claims", "About", "Contact"]
✅ CTA Text: "Get Free Quote" or "Compare Plans" (NOT "Get Started")
✅ Icon Box: Phone for agent contact
✅ Colors: Reassuring trust (blue #1e40af, green #059669)
✅ Height: 80-90px, professional financial services
✅ Sticky: YES - quote access while browsing`,

    "ecommerce": `
INDUSTRY-SPECIFIC HEADER DESIGN FOR E-COMMERCE:
✅ Layout Pattern: Logo left, Nav center, Search, Cart icon right
✅ Widget Selection: site-logo, nav-menu, search, cart-icon
✅ Menu Items: Based on product categories from site
✅ Search: Input box or icon - REQUIRED for ecommerce
✅ Cart Icon: REQUIRED - show item count
✅ Colors: Brand-appropriate, clear visual hierarchy
✅ Height: 70-80px, functional and clean
✅ Sticky: YES - cart and search always accessible`,

    "leadgen": `
INDUSTRY-SPECIFIC HEADER DESIGN FOR LEAD GENERATION:
✅ Layout Pattern: Logo left, Nav center/right, Phone icon-box, strong CTA
✅ Widget Selection: site-logo, nav-menu, icon-box (phone or email), button
✅ Menu Items: Service-focused navigation
✅ CTA Text: Industry-specific action (e.g., "Free Consultation", "Get Quote")
✅ Icon Box: Primary contact method (phone or email)
✅ Colors: Trust-building, industry-appropriate
✅ Height: 75-85px, professional
✅ Sticky: YES - lead capture access while scrolling`,
  };

  // Use industry-specific guidance or fall back to site-type guidance
  const guidance = industryGuidance[industry] || industryGuidance[siteType || "leadgen"] || industryGuidance["leadgen"];

  return guidance;
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
