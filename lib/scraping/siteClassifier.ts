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
  const industryResult = await classifyIndustry(content, url);

  // Identify conversion goals
  const conversionGoals = identifyConversionGoals(siteType, buttons, hasContactForm);

  return {
    siteType,
    confidence: Math.min(confidence, 1),
    industry: industryResult?.industry,
    industryDesignGuidance: industryResult?.designGuidance,
    conversionGoals,
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
