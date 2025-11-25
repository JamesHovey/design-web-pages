import Anthropic from "@anthropic-ai/sdk";

// Lazy initialization - only create client when needed (not during build)
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
    }
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

export const anthropic = {
  messages: {
    create: async (params: any) => {
      const client = getAnthropicClient();
      return client.messages.create(params);
    },
  },
};

/**
 * Classify website industry using Claude AI
 * Analyzes scraped content to determine the business industry
 */
export async function classifyIndustry(content: string, url: string): Promise<string | undefined> {
  const systemPrompt = `You are an expert at identifying business industries from website content.

Analyze the provided website content and determine the primary industry category.

Available industries:
- transportation (vehicle transport, shipping, logistics, freight, courier, haulage, moving services)
- automotive (car repair, mechanics, garages, MOT testing, vehicle servicing)
- legal (law firms, solicitors, attorneys, barristers)
- healthcare (medical, clinics, hospitals, doctors, health services)
- restaurant (restaurants, cafes, food service, catering)
- saas (software, platforms, web apps, SaaS products)
- fashion (clothing, apparel, fashion retail)
- real-estate (property sales, estate agents, real estate)
- finance (banking, investment, financial services, insurance)
- construction (builders, contractors, renovation, construction services)
- education (schools, universities, training, courses)

Return ONLY the industry name from the list above, or "unknown" if none match well.
Do not include any explanation or additional text.`;

  try {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 50,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `URL: ${url}\n\nWebsite content:\n${content.substring(0, 3000)}`,
        },
      ],
    });

    const response = message.content[0];
    if (response.type === "text") {
      const industry = response.text.trim().toLowerCase();
      return industry === "unknown" ? undefined : industry;
    }

    return undefined;
  } catch (error) {
    console.error("Industry classification error:", error);
    return undefined;
  }
}

/**
 * Generate website design using Claude Sonnet 4.5
 * Following critical design principles for distinctive, non-generic designs
 */
export async function generateDesign(prompt: string) {
  const systemPrompt = `You are an expert website designer that creates distinctive, production-grade designs.

CRITICAL PRINCIPLES:
1. AVOID: Centered everything, three-column grids, uniform padding, generic CTAs
2. USE: Asymmetric layouts (70/30 splits), varied spacing (40px-160px), dramatic typography
3. Apply industry-specific personality and imagery
4. Create strategic color use with gradients and overlays
5. Ensure WCAG AA accessibility (AAA preferred)
6. Generate specific, meaningful content (not generic phrases)

Return a JSON object with the design specification.`;

  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return message.content;
}
