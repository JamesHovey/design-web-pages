import { ScrapedData } from "./puppeteerService";

export type SiteType = "ecommerce" | "leadgen";

export interface ClassificationResult {
  siteType: SiteType;
  confidence: number;
  industry?: string;
  conversionGoals: string[];
}

/**
 * Classify website as e-commerce or lead generation
 * Checks for shopping cart, product pages, checkout vs contact forms
 */
export function classifySite(scrapedData: ScrapedData): ClassificationResult {
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

  // Detect industry (basic heuristics - can be enhanced with AI)
  const industry = detectIndustry(content);

  // Identify conversion goals
  const conversionGoals = identifyConversionGoals(siteType, buttons, hasContactForm);

  return {
    siteType,
    confidence: Math.min(confidence, 1),
    industry,
    conversionGoals,
  };
}

function detectIndustry(content: string): string | undefined {
  const industries = [
    { name: "legal", keywords: ["law", "attorney", "lawyer", "legal"] },
    { name: "healthcare", keywords: ["health", "medical", "doctor", "clinic"] },
    { name: "restaurant", keywords: ["restaurant", "food", "menu", "dining"] },
    { name: "saas", keywords: ["software", "platform", "dashboard", "api"] },
    { name: "fashion", keywords: ["fashion", "clothing", "apparel", "style"] },
    { name: "real-estate", keywords: ["property", "real estate", "home", "listing"] },
    { name: "finance", keywords: ["finance", "investment", "banking", "loan"] },
  ];

  for (const industry of industries) {
    const matches = industry.keywords.filter((keyword) => content.includes(keyword)).length;
    if (matches >= 2) {
      return industry.name;
    }
  }

  return undefined;
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
