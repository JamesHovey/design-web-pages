import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

  const message = await anthropic.messages.create({
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
