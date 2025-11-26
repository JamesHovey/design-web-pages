import type { Project } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// 🔥 S1.PNG TEST MODE - Toggle this to true for exact s1.png header replication
const S1_TEST_MODE = false;

/**
 * 🔥 TEST MODE: Generate 3 headers matching s1.png exactly
 * Returns hardcoded design variations based on the s1.png reference header
 */
function generateS1StyleHeaders(project: any): DesignVariation[] {
  // Extract company name from URL or use project data
  const companyName = extractCompanyName(project.url, project.scrapedContent);

  // S1.PNG exact specifications: Dark sophisticated tech header
  const baseHeader = {
    layout: "modern",
    height: 75,
    backgroundColor: "#1a1d2e", // Dark navy from s1.png
    sticky: true,
    widgets: [
      {
        type: "site-logo",
        imageUrl: project.logoUrl || null,
        alt: `${companyName} logo`,
        width: 160,
        position: "left",
        // If no logo image, use text logo like s1.png
        textLogo: !project.logoUrl ? companyName : null,
        textLogoStyle: {
          color: "#ffffff",
          fontSize: "20px",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "1px"
        }
      },
      {
        type: "nav-menu",
        items: [
          { text: "Services", link: "#services" },
          { text: "Industries", link: "#industries" },
          { text: "About", link: "#about" }
        ],
        style: "horizontal",
        alignment: "right",
        itemStyle: {
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: "400",
          spacing: "32px"
        }
      },
      {
        type: "button",
        text: "Get in touch",
        link: "#contact",
        size: "md",
        style: "outline",
        position: "right",
        customStyle: {
          border: "2px solid #00bcd4", // Cyan from s1.png
          color: "#ffffff",
          backgroundColor: "transparent",
          borderRadius: "24px", // Pill shape
          padding: "10px 28px",
          fontSize: "15px",
          fontWeight: "500",
          hoverBackground: "#00bcd4",
          hoverColor: "#ffffff"
        }
      }
    ]
  };

  // Return 3 variations - all matching s1.png with minor tweaks
  return [
    {
      name: "Conservative",
      description: "Dark sophisticated header matching s1.png reference - clean tech aesthetic with minimal widgets",
      widgetStructure: {
        globalHeader: {
          ...baseHeader,
          backgroundColor: "#1a1d2e" // Exact s1.png dark navy
        }
      },
      rationale: "Replicates the s1.png professional tech header exactly. Dark background creates high contrast and sophistication. Minimal widget set (logo, nav, CTA) focuses user attention. Outline button style is modern and professional.",
      ctaStrategy: "Single prominent 'Get in touch' CTA button in outline style with cyan accent color, matching s1.png exactly",
      designDecisions: {
        layoutApproach: "Modern horizontal layout - logo left, navigation right-aligned, CTA button far right (s1.png pattern)",
        colorStrategy: "Dark navy background (#1a1d2e) with white text and cyan accent (#00bcd4) - exact s1.png colors",
        typographyScale: "Logo 20px, Nav items 15px, consistent sizing matching s1.png",
        spacingSystem: "32px spacing between nav items, professional padding - s1.png specifications",
        asymmetry: "Symmetric layout with balanced weight distribution"
      }
    },
    {
      name: "Balanced",
      description: "Dark sophisticated header matching s1.png reference - balanced professional appearance",
      widgetStructure: {
        globalHeader: {
          ...baseHeader,
          backgroundColor: "#0f1219", // Slightly darker variation
          height: 75
        }
      },
      rationale: "Maintains s1.png professional aesthetic with slightly adjusted darkness for variation. Same minimal widget approach with high-contrast design. Perfect balance of professionalism and modernity.",
      ctaStrategy: "Outline CTA button 'Get in touch' with cyan border - s1.png style maintained",
      designDecisions: {
        layoutApproach: "Modern layout matching s1.png - logo left, nav right, button far right",
        colorStrategy: "Darker navy (#0f1219) with white text and cyan (#00bcd4) accent - s1.png inspired",
        typographyScale: "Matching s1.png - Logo 20px, Nav 15px, Button 15px",
        spacingSystem: "s1.png spacing grid - 32px nav spacing, proper padding",
        asymmetry: "Symmetric professional layout"
      }
    },
    {
      name: "Bold",
      description: "Dark sophisticated header matching s1.png reference - bold high-contrast version",
      widgetStructure: {
        globalHeader: {
          ...baseHeader,
          backgroundColor: "#0a0e1a", // Deepest dark variation
          height: 80,
          widgets: [
            ...baseHeader.widgets.slice(0, 2), // Logo and nav
            {
              ...baseHeader.widgets[2], // Button
              customStyle: {
                ...baseHeader.widgets[2].customStyle,
                border: "2px solid #00e5ff", // Brighter cyan
                padding: "12px 32px" // Slightly larger
              }
            }
          ]
        }
      },
      rationale: "Bold interpretation of s1.png with deepest dark background and brighter cyan accent. Maintains exact layout and widget structure while pushing visual impact. Maximum sophistication.",
      ctaStrategy: "Prominent outline button with brighter cyan (#00e5ff) for maximum visibility - s1.png enhanced",
      designDecisions: {
        layoutApproach: "Exact s1.png layout - modern horizontal with right-aligned navigation",
        colorStrategy: "Deepest navy (#0a0e1a) with bright cyan accent (#00e5ff) - s1.png amplified",
        typographyScale: "s1.png specifications - 20px logo, 15px nav, 15px button",
        spacingSystem: "s1.png grid maintained - 32px spacing, professional padding",
        asymmetry: "Symmetric balanced layout matching reference"
      }
    }
  ];
}

/**
 * Extract company name from URL or scraped content
 */
function extractCompanyName(url: string, scrapedContent: any): string {
  // Try to get from scraped title
  if (scrapedContent?.title) {
    const title = scrapedContent.title.split('|')[0].split('-')[0].trim();
    if (title.length > 0 && title.length < 50) {
      return title;
    }
  }

  // Extract from URL domain
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const name = domain.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return "COMPANY";
  }
}

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
 *
 * @param project - Project data including configuration and metadata
 * @param referenceMode - How to select reference screenshots (defaults to project config or "industry-matched")
 */
export async function generateDesignVariations(
  project: any,
  referenceMode?: "all" | "random" | "industry-matched" | "curated" | "custom"
): Promise<DesignVariation[]> {
  // 🔥 TEST MODE: Return hardcoded s1.png-style headers
  if (S1_TEST_MODE) {
    console.log("🔥 S1 TEST MODE ACTIVE: Returning hardcoded s1.png-style headers");
    return generateS1StyleHeaders(project);
  }

  // Determine reference selection mode
  const mode = referenceMode || project.referenceStyleMode || "industry-matched";
  console.log(`[Design Generation] Using reference mode: ${mode}`);

  const systemPrompt = `You are an expert website designer creating PROFESSIONAL, PRODUCTION-GRADE GLOBAL HEADERS for Elementor websites.

🎯 MANDATORY STYLE REFERENCE: s1.png
The FIRST image (s1.png) you will see is THE REQUIRED STYLE TEMPLATE. ALL headers must match this exact visual style.

📋 REQUIRED STYLE SPECIFICATIONS FROM s1.png:
YOU MUST FOLLOW THESE SPECIFICATIONS EXACTLY:

1. ✅ BACKGROUND: Dark navy (#1a1d2e, #1a1a2e, or similar dark sophisticated color)
   - NEVER use white, light gray, or bright colors
   - All three variations MUST use dark backgrounds

2. ✅ LAYOUT PATTERN: Logo left, Navigation right-aligned, CTA button far right
   - This is MANDATORY - do not deviate from this pattern

3. ✅ LOGO:
   - If logoUrl provided: Display image logo in white/light version
   - If NO logoUrl: Create text logo in WHITE, uppercase, bold (20px, 700 weight, letter-spacing: 1px)

4. ✅ NAVIGATION MENU:
   - Right-aligned horizontal menu
   - White text (#ffffff)
   - 15px font size, 400-600 weight
   - 32px spacing between items
   - Customize menu items based on the industry (e.g., "Services", "Industries", "About" for b2b)

5. ✅ CTA BUTTON (CRITICAL):
   - Style: OUTLINE (transparent background with colored border)
   - Border: 2px solid with cyan/blue color (#00bcd4, #00e5ff, or brand color)
   - Color: White text
   - Border-radius: 24px (pill shape)
   - Padding: 10-12px vertical, 28-32px horizontal
   - Font: 15px, 500-600 weight
   - Hover: Background fills with border color
   - Text: Industry-appropriate (e.g., "Get in touch", "Get A Quote", "Contact Us")

6. ✅ HEIGHT: 75-80px (do not exceed 85px)

7. ✅ TYPOGRAPHY: All text must be white/light (#ffffff) for contrast on dark background

8. ✅ MINIMAL WIDGETS: Use ONLY logo + nav + button (no phone icons, no search, no cart unless ecommerce)
   - Keep it clean and sophisticated like s1.png

CURRENT FOCUS: GLOBAL HEADER ONLY
- Generate ONLY the global header structure
- No body content, no hero sections, no features - JUST the header
- Customize the CONTENT (menu items, CTA text, company name) to the industry
- Keep the STYLE exactly matching s1.png

HEADER WIDGET SCHEMA (Elementor):
Use ONLY these widgets for the global header:

- site-logo: { type: "site-logo", imageUrl: "${project.logoUrl || null}", width?: number, height?: number, alt?: string }
- nav-menu: { type: "nav-menu", items: [{text: string, link?: string}], style?: "horizontal"|"vertical", alignment?: "left"|"center"|"right" }
- search: { type: "search", style: "icon"|"input-box", placeholder?: string }
- icon-box: { type: "icon-box", icon: "phone"|"email"|"location"|"chat", text: string, description?: string, isHeader: true, link?: string }
  * IMPORTANT: For headers, ALWAYS set isHeader: true
  * For phone: text should be the actual phone number (e.g., "01306 775010" or "+1 (212) 424-6015")
  * For phone: description can be "Call us:" or "24/7 Support" or similar
  * For email: text should be the email address, description can be "Email us:"
  * icon-box creates prominent, professional contact widgets with icon + text layout
- button: { type: "button", text: string, link?: string, size?: "sm"|"md"|"lg", style?: "primary"|"secondary"|"outline" }
  * CRITICAL: Use industry-appropriate CTA text - NOT generic "Get Started"
  * Examples: "Get A Quote", "Contact Us", "Book Consultation", "Get In Touch", "Speak To An Expert"
  * Size: Use "md" or "lg" for header CTAs (buttons should be prominent)
  * Professional buttons are LARGE with high contrast colors
- cart-icon: { type: "cart-icon", itemCount?: number }

GLOBAL HEADER CONFIGURATION:
User has configured these header options:
${JSON.stringify(project.globalHeaderConfig || {})}

HEADER DESIGN RULES (s1.png STYLE ENFORCED):
1. ✅ ALL variations must use dark navy backgrounds (#1a1d2e or similar)
2. ✅ ALL variations must use logo left + nav right + outline button pattern
3. ✅ Menu items should be customized based on: ${JSON.stringify(project.globalHeaderConfig?.menuItems || ["Home", "About", "Services", "Contact"])}
4. ✅ Button text should be industry-appropriate for ${project.industry || "general"} industry
5. ✅ Keep widget selection MINIMAL - only logo, nav, button (match s1.png simplicity)

DESIGN VARIATIONS - s1.png STYLE WITH MINOR TWEAKS:
ALL THREE VARIATIONS MUST MATCH s1.png VISUAL STYLE. Only vary these minor elements:

1. Conservative (Exact s1.png Match):
   - Background: #1a1d2e (exact s1.png color)
   - Height: 75px
   - Button border: #00bcd4 (cyan, matching s1.png)
   - Logo: 160px wide
   - Nav spacing: 32px
   - CLOSEST to s1.png reference

2. Balanced (s1.png Style, Slightly Adjusted):
   - Background: #1a1a2e or #0f1219 (slightly different dark navy)
   - Height: 75-78px
   - Button border: Brand color or #00bcd4
   - Logo: 160-180px wide
   - Nav spacing: 32px
   - SAME visual style as s1.png, minor color variation

3. Bold (s1.png Style, Enhanced):
   - Background: #0a0e1a (deepest navy) or #1e293b
   - Height: 78-80px
   - Button border: Brighter cyan (#00e5ff) or brand color
   - Logo: 180-200px wide
   - Button: Slightly larger padding (12px 32px)
   - SAME visual style as s1.png, bolder version

JSON FORMAT REQUIREMENTS:
- Return ONLY valid JSON - no trailing commas, no comments, no markdown code blocks
- Ensure all quotes in text content are properly escaped
- Double-check JSON syntax before responding
- The response must be parseable by JSON.parse()
- All widget properties must match Elementor schema specifications

Return JSON array with 3 design variations.`;

  const userPrompt = `🎯 CRITICAL REQUIREMENT: Generate 3 headers that EXACTLY MATCH the s1.png VISUAL STYLE shown in the first image.

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

🚨 MANDATORY STYLE REQUIREMENTS (from s1.png):
- Dark navy background (#1a1d2e or similar) - NOT white, NOT light
- Logo left, navigation right-aligned, outline button far right
- White text throughout for contrast
- Outline button with cyan/blue border (#00bcd4 or brand color)
- Clean minimal design - only logo + nav + button
- Height: 75-80px

CUSTOMIZE THE CONTENT, NOT THE STYLE:
- Write industry-specific menu items (not generic "Home, About, Services")
- Use industry-appropriate CTA button text (not "Get Started")
- Extract company name from scraped content or URL
- ALL visual styling must match s1.png exactly

For each variation, provide:
{
  "name": "Conservative" | "Balanced" | "Bold",
  "description": "s1.png style header with [customization description]",
  "widgetStructure": {
    "globalHeader": {
      "layout": "modern",
      "height": 75-80,
      "backgroundColor": "#1a1d2e" or similar dark navy,
      "sticky": true,
      "widgets": [
        {
          "type": "site-logo",
          "imageUrl": ${project.logoUrl ? `"${project.logoUrl}"` : "null"},
          "textLogo": "COMPANY NAME" (if no imageUrl),
          "textLogoStyle": {
            "color": "#ffffff",
            "fontSize": "20px",
            "fontWeight": "700",
            "textTransform": "uppercase",
            "letterSpacing": "1px"
          },
          "width": 160-180,
          "position": "left"
        },
        {
          "type": "nav-menu",
          "items": [Industry-specific menu items],
          "style": "horizontal",
          "alignment": "right",
          "itemStyle": {
            "color": "#ffffff",
            "fontSize": "15px",
            "fontWeight": "400",
            "spacing": "32px"
          }
        },
        {
          "type": "button",
          "text": "Industry-appropriate CTA (e.g., 'Get A Quote', 'Contact Us', 'Get In Touch')",
          "style": "outline",
          "size": "md",
          "position": "right",
          "customStyle": {
            "border": "2px solid #00bcd4",
            "color": "#ffffff",
            "backgroundColor": "transparent",
            "borderRadius": "24px",
            "padding": "10px 28px",
            "fontSize": "15px",
            "fontWeight": "500",
            "hoverBackground": "#00bcd4",
            "hoverColor": "#ffffff"
          }
        }
      ]
    }
  },
  "rationale": "s1.png professional style adapted for [industry]",
  "ctaStrategy": "Industry-specific CTA using s1.png outline button style",
  "designDecisions": {
    "layoutApproach": "s1.png modern layout - logo left, nav right, button far right",
    "colorStrategy": "Dark navy background with white text and cyan accent (s1.png style)",
    "typographyScale": "s1.png specifications - 20px logo, 15px nav, 15px button",
    "spacingSystem": "32px nav spacing, professional padding (s1.png grid)",
    "asymmetry": "Symmetric balanced layout matching s1.png"
  }
}

🚨 CRITICAL REQUIREMENTS:
- Return ONLY a valid JSON array of exactly 3 header variations (no markdown, no code blocks)
- ALL three variations MUST use dark navy backgrounds like s1.png
- ALL three variations MUST use the logo left + nav right + outline button pattern
- ALL three variations MUST use white text and outline buttons
- Customize CONTENT (menu items, CTA text, company name) for the industry
- Keep STYLE matching s1.png exactly
- Ensure all JSON is properly formatted with NO trailing commas`;

  const client = getAnthropicClient();

  // Load professional header screenshot references with selected mode
  const headerScreenshots = loadHeaderScreenshots(mode, {
    industry: project.industry,
    count: project.referenceCount,
    customFiles: project.customReferenceFiles,
  });

  console.log(`[Design Generation] Loaded ${headerScreenshots.length} reference screenshots using ${mode} mode`);

  // Construct multi-modal message content with images + text
  const messageContent: Array<any> = [
    {
      type: "text",
      text: "🎯 THE FIRST IMAGE (s1.png) IS YOUR MANDATORY STYLE TEMPLATE. You MUST match this exact visual style for all 3 header variations.\n\nThe remaining images show other professional headers for reference ONLY - do NOT copy their styles. ALL your designs must match s1.png style (dark navy background, logo left, nav right, outline button).\n\nStudy s1.png carefully:",
    },
    ...headerScreenshots,
    {
      type: "text",
      text: userPrompt,
    },
  ];

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 16384, // Increased from 8192 to prevent cutoff
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: messageContent,
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
✅ Widget Selection: site-logo, nav-menu, icon-box (phone with isHeader: true), button
✅ Menu Items: ["Home", "Services", "Fleet", "Track Shipment", "Get Quote", "Contact"]
✅ CTA Text: "Get Free Quote" or "Book Transport" (NOT "Get Started")
✅ Phone Icon-Box: { icon: "phone", text: "1-800-TRANSPORT", description: "24/7 Dispatch", isHeader: true }
✅ Background Color: White or light blue (#f0f4f8) - Professional and clean
✅ Colors: Blues (#003d82, #0066cc) and grays for trust and reliability
✅ Height: 80-90px for professional appearance
✅ Sticky: YES - users need access to contact info while scrolling`,

    "restaurant": `
INDUSTRY-SPECIFIC HEADER DESIGN FOR RESTAURANT:
✅ Layout Pattern: Logo left, Nav menu center, Phone icon-box + CTA "Reserve Table"
✅ Widget Selection: site-logo, nav-menu, icon-box (phone with isHeader: true), button
✅ Menu Items: ["Menu", "Reservations", "Our Story", "Catering", "Contact", "Order Online"]
✅ CTA Text: "Reserve Table" or "Order Now" (NOT "Get Started")
✅ Phone Icon-Box: { icon: "phone", text: "(555) 123-4567", description: "Call to Reserve", isHeader: true }
✅ Background Color: Warm tones OR white with warm-colored CTA
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
 * Industry-to-screenshot mapping for intelligent reference selection
 * Maps industries to the most relevant header screenshot files
 */
const INDUSTRY_SCREENSHOT_MAP: Record<string, string[]> = {
  "vehicle-transport": ["s5.png", "s12.png", "s20.png", "s30.png", "s45.png"],
  "restaurant": ["s22.png", "s30.png", "s45.png", "s50.png", "s55.png"],
  "dental-practice": ["s1.png", "s20.png", "s30.png", "s45.png", "s59.png"],
  "law-firm": ["s1.png", "s12.png", "s20.png", "s22.png", "s30.png"],
  "real-estate": ["s1.png", "s5.png", "s30.png", "s45.png", "s59.png"],
  "fitness": ["s5.png", "s22.png", "s30.png", "s45.png", "s55.png"],
  "beauty-salon": ["s22.png", "s30.png", "s45.png", "s50.png", "s55.png"],
  "home-services": ["s5.png", "s12.png", "s20.png", "s30.png", "s45.png"],
  "photography": ["s1.png", "s30.png", "s45.png", "s55.png", "s59.png"],
  "insurance": ["s1.png", "s12.png", "s20.png", "s30.png", "s45.png"],
  "ecommerce": ["s1.png", "s5.png", "s30.png", "s55.png", "s59.png"],
  "leadgen": ["s1.png", "s5.png", "s12.png", "s20.png", "s30.png"],
  "b2b": ["s1.png", "s12.png", "s20.png", "s30.png", "s45.png"],
};

/**
 * Get all available screenshot filenames
 */
function getAllScreenshots(): string[] {
  const screenshotDir = path.join(process.cwd(), "public", "reference-headers");

  if (!fs.existsSync(screenshotDir)) {
    console.warn("Reference headers directory not found:", screenshotDir);
    return [];
  }

  return fs.readdirSync(screenshotDir)
    .filter(file => file.endsWith('.png'))
    .sort(); // Sort for consistent ordering
}

/**
 * Load professional header screenshot references
 * Supports multiple selection modes for maximum flexibility
 *
 * @param mode - Selection mode: "all" | "random" | "industry-matched" | "curated" | "custom"
 * @param options - Additional options (industry, count, customFiles)
 * @returns Array of base64-encoded header images
 */
function loadHeaderScreenshots(
  mode: "all" | "random" | "industry-matched" | "curated" | "custom" = "curated",
  options: {
    industry?: string;
    count?: number;
    customFiles?: string[];
  } = {}
): Array<{ type: "image"; source: { type: "base64"; media_type: string; data: string } }> {
  const screenshotDir = path.join(process.cwd(), "public", "reference-headers");
  let selectedScreenshots: string[] = [];

  switch (mode) {
    case "all":
      // Load ALL 59 screenshots for maximum variety
      selectedScreenshots = getAllScreenshots();
      console.log(`[Reference Selection] Using ALL ${selectedScreenshots.length} reference screenshots`);
      break;

    case "random":
      // Randomly select N screenshots (default 10-15)
      const count = options.count || Math.floor(Math.random() * 6) + 10; // Random between 10-15
      const allScreenshots = getAllScreenshots();
      selectedScreenshots = shuffleArray(allScreenshots).slice(0, count);
      console.log(`[Reference Selection] Randomly selected ${selectedScreenshots.length} screenshots`);
      break;

    case "industry-matched":
      // Select screenshots based on project industry
      const industry = options.industry || "general";
      const industryKey = Object.keys(INDUSTRY_SCREENSHOT_MAP).find(key =>
        industry.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(industry.toLowerCase())
      );

      if (industryKey && INDUSTRY_SCREENSHOT_MAP[industryKey]) {
        selectedScreenshots = INDUSTRY_SCREENSHOT_MAP[industryKey];
        console.log(`[Reference Selection] Using industry-matched screenshots for ${industry}: ${selectedScreenshots.length} files`);
      } else {
        // Fallback to curated selection
        selectedScreenshots = INDUSTRY_SCREENSHOT_MAP["leadgen"];
        console.log(`[Reference Selection] No industry match for ${industry}, using leadgen fallback`);
      }
      break;

    case "custom":
      // Use custom-specified screenshot files
      selectedScreenshots = options.customFiles || [];
      console.log(`[Reference Selection] Using ${selectedScreenshots.length} custom-specified screenshots`);
      break;

    case "curated":
    default:
      // Original curated selection of 10 representative headers
      selectedScreenshots = [
        "s1.png",   // Dark sophisticated header
        "s5.png",   // Orange branded header with prominent phone
        "s12.png",  // Two-row header with dual phone numbers
        "s20.png",  // Two-row utility bar pattern
        "s22.png",  // Purple/dark top bar with white main nav
        "s30.png",  // Clean white professional header
        "s45.png",  // Two-row with consultation CTA
        "s50.png",  // Announcement bar example
        "s55.png",  // Centered logo variation
        "s59.png",  // Modern e-commerce header
      ];
      console.log(`[Reference Selection] Using curated selection of ${selectedScreenshots.length} screenshots`);
      break;
  }

  // Load the selected screenshots as base64
  const imageBlocks: Array<{ type: "image"; source: { type: "base64"; media_type: string; data: string } }> = [];

  for (const filename of selectedScreenshots) {
    const filepath = path.join(screenshotDir, filename);

    if (fs.existsSync(filepath)) {
      const imageBuffer = fs.readFileSync(filepath);
      const base64Image = imageBuffer.toString("base64");

      imageBlocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/png",
          data: base64Image,
        },
      });
    } else {
      console.warn(`[Reference Selection] Screenshot not found: ${filename}`);
    }
  }

  return imageBlocks;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
