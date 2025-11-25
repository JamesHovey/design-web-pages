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
 * Advanced industry classification using Claude AI
 * Returns industry identifier and design personality guidance for ANY business type
 * NO RESTRICTIONS - can identify any industry intelligently
 */
export async function classifyIndustry(content: string, url: string): Promise<{
  industry: string;
  designGuidance: string;
} | undefined> {
  const systemPrompt = `You are an expert business analyst and web design consultant.

Analyze the website content and provide:
1. PRIMARY industry classification
2. Industry-specific web design guidance

CLASSIFICATION REQUIREMENTS:
- Identify the core business activity
- Be specific (e.g., "vehicle-transport" not just "transportation")
- Use kebab-case (e.g., "dental-practice", "wedding-photography", "craft-brewery")
- Consider URL domain for context
- Can be ANY industry - you are not limited to a predefined list
- Use standard industry terminology

ANALYZE:
- Products/services offered
- Target audience and language tone
- Industry terminology and jargon
- Business model (B2B, B2C, local service, national, etc.)
- Professional credentials/certifications mentioned
- Geographic scope (local, regional, national, international)

DESIGN GUIDANCE SHOULD SPECIFY:
- Color psychology for this specific industry
- Typography approach (modern/traditional, serif/sans-serif)
- Imagery style (photography, illustrations, icons)
- Layout patterns successful in this industry
- Trust signals customers expect
- Conversion elements (CTAs, forms, booking, etc.)
- Visual tone (professional, friendly, luxurious, edgy, etc.)

Return ONLY valid JSON with this structure:
{
  "industry": "specific-industry-identifier",
  "designGuidance": "Comprehensive design personality: [colors, typography, imagery, layout patterns, trust signals, conversion elements]"
}`;

  try {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 400,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `URL: ${url}\n\nWebsite content:\n${content.substring(0, 4000)}`,
        },
      ],
    });

    const response = message.content[0];
    if (response.type === "text") {
      const result = JSON.parse(response.text.trim());
      return {
        industry: result.industry?.toLowerCase() || "general-business",
        designGuidance: result.designGuidance || "Modern, professional aesthetic",
      };
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
