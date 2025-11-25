import { ScrapedData } from "./puppeteerService";
import { classifyIndustry } from "@/lib/ai/claude";

export type SiteType = "ecommerce" | "leadgen";

export interface ClassificationResult {
  siteType: SiteType;
  confidence: number;
  industry?: string;
  industryDesignGuidance?: string;
  conversionGoals: string[];
}

/**
 * Classify website as e-commerce or lead generation
 * Checks for shopping cart, product pages, checkout vs contact forms
 * Uses Claude AI to intelligently detect industry
 */
export async function classifySite(scrapedData: ScrapedData, url: string): Promise<ClassificationResult> {
  const content = scrapedData.content.toLowerCase();
  const buttons = scrapedData.buttons.map((b) => b.text.toLowerCase());
  const forms = scrapedData.forms;

  // E-commerce indicators
  const ecommerceKeywords = [
    "add to cart",
    "checkout",
    "shop now",
    "buy now",
    "product",
    "cart",
    "shopping",
    "price",
    "$",
  ];
  const ecommerceScore = ecommerceKeywords.filter(
    (keyword) => content.includes(keyword) || buttons.some((b) => b.includes(keyword))
  ).length;

  // Lead generation indicators
  const leadgenKeywords = [
    "contact us",
    "get a quote",
    "request",
    "consultation",
    "schedule",
    "book",
    "demo",
    "trial",
  ];
  const leadgenScore = leadgenKeywords.filter(
    (keyword) => content.includes(keyword) || buttons.some((b) => b.includes(keyword))
  ).length;

  // Check for contact forms (lead gen indicator)
  const hasContactForm = forms.some((form) =>
    form.fields.some((f) => f.includes("email") || f.includes("phone") || f.includes("message"))
  );

  const siteType: SiteType = ecommerceScore > leadgenScore ? "ecommerce" : "leadgen";
  const confidence = Math.max(ecommerceScore, leadgenScore) / 10; // Normalize to 0-1

  // Detect industry using Claude AI for accurate classification (unrestricted - handles ANY industry)
  let industryResult = await classifyIndustry(content, url);

  // Fallback: If AI classification fails, use heuristic-based detection
  if (!industryResult || !industryResult.industry) {
    console.warn("[Site Classifier] AI industry detection failed, using fallback heuristics");
    const fallbackIndustry = detectIndustryFallback(content, url, buttons);
    industryResult = {
      industry: fallbackIndustry.industry,
      designGuidance: fallbackIndustry.designGuidance,
    };
  }

  // Identify conversion goals
  const conversionGoals = identifyConversionGoals(siteType, buttons, hasContactForm);

  return {
    siteType,
    confidence: Math.min(confidence, 1),
    industry: industryResult.industry,
    industryDesignGuidance: industryResult.designGuidance,
    conversionGoals,
  };
}

/**
 * Fallback industry detection using heuristic keywords
 * Used when AI classification fails
 */
function detectIndustryFallback(
  content: string,
  url: string,
  buttons: string[]
): { industry: string; designGuidance: string } {
  const lowerContent = content.toLowerCase();
  const lowerUrl = url.toLowerCase();

  // Industry keyword patterns
  const industryPatterns = [
    {
      keywords: ["transport", "vehicle", "shipping", "delivery", "logistics", "freight"],
      industry: "vehicle-transport",
      guidance: "Professional and trustworthy design with bold typography. Use blues and grays for reliability. Feature vehicle imagery, service areas, and contact information prominently."
    },
    {
      keywords: ["restaurant", "food", "menu", "dining", "cuisine", "cafe", "bistro"],
      industry: "restaurant",
      guidance: "Appetizing design with food photography. Use warm colors (reds, oranges, yellows). Highlight menu, reservations, and location."
    },
    {
      keywords: ["dental", "dentist", "orthodontic", "teeth", "smile"],
      industry: "dental-practice",
      guidance: "Clean, professional design with calming colors (blues, whites). Feature patient testimonials, services, and appointment booking."
    },
    {
      keywords: ["law", "legal", "attorney", "lawyer", "firm"],
      industry: "law-firm",
      guidance: "Professional, authoritative design with traditional serif fonts. Use navy, burgundy, gold. Emphasize expertise and trust."
    },
    {
      keywords: ["real estate", "property", "homes", "realty", "housing"],
      industry: "real-estate",
      guidance: "Modern, aspirational design with property imagery. Use professional photography, search features, and agent profiles."
    },
    {
      keywords: ["fitness", "gym", "workout", "training", "health club"],
      industry: "fitness",
      guidance: "Energetic design with dynamic imagery. Use bold colors and strong CTAs for memberships and classes."
    },
    {
      keywords: ["salon", "spa", "beauty", "hair", "massage", "wellness"],
      industry: "beauty-salon",
      guidance: "Elegant, soothing design with soft colors (pastels, neutrals). Feature services, pricing, and booking."
    },
    {
      keywords: ["plumbing", "plumber", "hvac", "electrician", "contractor"],
      industry: "home-services",
      guidance: "Trustworthy, professional design. Use blue and orange for reliability. Feature emergency contact, services, and testimonials."
    },
    {
      keywords: ["photography", "photographer", "photo", "portrait", "wedding"],
      industry: "photography",
      guidance: "Portfolio-focused design with stunning imagery. Minimize text, maximize visual impact."
    },
    {
      keywords: ["insurance", "coverage", "policy", "claims"],
      industry: "insurance",
      guidance: "Professional, reassuring design. Use blues and greens. Emphasize trust, coverage options, and quotes."
    },
  ];

  // Check for industry matches
  for (const pattern of industryPatterns) {
    const matches = pattern.keywords.filter(
      keyword => lowerContent.includes(keyword) || lowerUrl.includes(keyword)
    );
    if (matches.length >= 1) {
      return {
        industry: pattern.industry,
        designGuidance: pattern.guidance,
      };
    }
  }

  // Default fallback
  return {
    industry: "general-business",
    designGuidance: "Modern, professional design with clear visual hierarchy. Use neutral colors with accent highlights. Feature services, about section, and strong call-to-action elements."
  };
}

function identifyConversionGoals(
  siteType: SiteType,
  buttons: string[],
  hasContactForm: boolean
): string[] {
  const goals: string[] = [];

  if (siteType === "ecommerce") {
    goals.push("Product purchases", "Add to cart conversions");
    if (buttons.some((b) => b.includes("subscribe") || b.includes("newsletter"))) {
      goals.push("Email list signups");
    }
  } else {
    if (hasContactForm) {
      goals.push("Contact form submissions");
    }
    if (buttons.some((b) => b.includes("quote") || b.includes("consultation"))) {
      goals.push("Quote/consultation requests");
    }
    if (buttons.some((b) => b.includes("call") || b.includes("phone"))) {
      goals.push("Phone call conversions");
    }
  }

  return goals;
}
