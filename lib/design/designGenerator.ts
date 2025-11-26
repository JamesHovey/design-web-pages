import type { Project } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// 🔥 S1.PNG TEST MODE - Toggle this to true for exact s1.png header replication
const S1_TEST_MODE = true;

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
 */
export async function generateDesignVariations(
  project: any
): Promise<DesignVariation[]> {
  // 🔥 TEST MODE: Return hardcoded s1.png-style headers
  if (S1_TEST_MODE) {
    console.log("🔥 S1 TEST MODE ACTIVE: Returning hardcoded s1.png-style headers");
    return generateS1StyleHeaders(project);
  }

  const systemPrompt = `You are an expert website designer creating PROFESSIONAL, PRODUCTION-GRADE GLOBAL HEADERS for Elementor websites.

🖼️ PROFESSIONAL REFERENCES PROVIDED:
You will be shown 10 professional WordPress/Elementor header screenshots as visual examples.
Study these carefully to understand:
- Professional layout patterns (logo left, nav center/right, CTA placement)
- Widget arrangements (search, cart, phone icons, buttons)
- Visual hierarchy and spacing
- Color schemes and contrast
- Professional vs. amateur design patterns
- Two-row headers (utility bar + main nav)
- Contact prominence (phone numbers, CTAs)

CURRENT FOCUS: GLOBAL HEADER ONLY
- We are building incrementally - headers FIRST, then body sections later
- Generate ONLY the global header structure
- No body content, no hero sections, no features - JUST the header

CRITICAL HEADER DESIGN PRINCIPLES:
1. ✅ Professional styling: Match the quality shown in the reference screenshots
2. ✅ Industry-appropriate: ${project.industry || "general"} sites need specific visual language
3. ✅ Strategic layout: Logo placement, navigation hierarchy, CTA visibility (as seen in examples)
4. ✅ Professional patterns: Use 8px spacing grid, subtle shadows, smooth transitions
5. ✅ Smart widget selection: Choose header widgets intelligently based on site type and industry
6. ✅ Specific content: Write real menu items and contact info - NO "Lorem ipsum"

${getIndustryHeaderGuidance(project.industry, project.siteType)}

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

HEADER DESIGN RULES:
1. Choose widgets intelligently based on:
   - Site type: ${project.siteType} (ecommerce sites should include cart-icon)
   - Industry: ${project.industry || "general"} (service businesses should include icon-box with phone)
   - User configuration: Respect the globalHeaderConfig settings
2. Professional layout patterns:
   - Standard: Logo left, nav center, CTA right
   - Classic: Logo left, nav right, search/contact icons far right
   - Modern: Logo left, nav right, phone + CTA far right (MOST PROFESSIONAL)
3. Use the configured menu items: ${JSON.stringify(project.globalHeaderConfig?.menuItems || ["Home", "About", "Services", "Contact"])}
4. Background colors - PROFESSIONAL PATTERNS ONLY:
   - Conservative: Pure white (#ffffff) or very light gray (#f8f9fa, #fafbfc)
   - Balanced: White with subtle shadow OR very light tint of brand color (95% white + 5% brand)
   - Bold: Dark sophisticated (#1a1a2e, #2c3e50, #1e293b) OR subtle gradient on white
   - NEVER use solid bright colors as header background (looks amateur)
   - Brand colors go on BUTTONS and ACCENTS, not backgrounds
   - Professional rule: Header backgrounds should be neutral (white/light/dark), buttons should be colorful
5. Contact prominence:
   - For service businesses: ALWAYS include prominent phone icon-box
   - Phone should have isHeader: true for proper styling
   - Use description field for "Call us:" or "24/7 Support"
   - Position phone prominently in right section before CTA button
6. Apply professional design patterns:
   - 8px spacing grid (8px, 16px, 24px, 32px)
   - Shadow: 2px 2px 6px 0 rgba(0,0,0,0.3)
   - Transitions: 0.35s ease-out
   - Professional typography and color hierarchy

DESIGN VARIATIONS - HEADER EXAMPLES:
1. Conservative:
   - Background: Pure white (#ffffff)
   - Logo: 180px wide, professional
   - Nav: Centered, clean menu items
   - Right: Phone icon-box + Medium button with brand color
   - Professional, trustworthy, safe - but STILL distinctive

2. Balanced:
   - Background: Light gray (#f8f9fa) or white with subtle shadow
   - Logo: 200px wide with prominent brand colors
   - Nav: Right-aligned with good spacing
   - Right: Large phone icon-box + Large colorful button
   - Modern, engaging, strategic - the sweet spot

3. Bold:
   - Background: Dark sophisticated (#2c3e50) with white/light text
   - Logo: 220px wide, high contrast
   - Nav: Right-aligned with hover effects
   - Right: Extra prominent phone + Bold contrasting button
   - Dramatic, eye-catching, memorable - push boundaries

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
          "text": "Specific CTA based on industry (e.g., 'Get Free Quote', 'Book Now', 'Contact Us')",
          "style": "primary",
          "size": "md" or "lg",
          "position": "right"
        }
        // CRITICAL: For service businesses, include icon-box with phone BEFORE the button
        // Example right section for vehicle transport: [icon-box (phone), button]
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

  // Load professional header screenshot references
  const headerScreenshots = loadHeaderScreenshots();

  // Construct multi-modal message content with images + text
  const messageContent: Array<any> = [
    {
      type: "text",
      text: "Here are 10 professional WordPress/Elementor header examples to reference. Study these carefully for professional design patterns, layouts, widget usage, spacing, and visual hierarchy:",
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
 * Load professional header screenshot references
 * Returns a curated selection of 10 professional Elementor headers as base64 images
 */
function loadHeaderScreenshots(): Array<{ type: "image"; source: { type: "base64"; media_type: string; data: string } }> {
  const screenshotDir = path.join(process.cwd(), "public", "reference-headers");

  // Curated selection of 10 representative professional headers
  // Selected for diversity: various industries, layouts, and styles
  const selectedScreenshots = [
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
    }
  }

  return imageBlocks;
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
