import { NextRequest, NextResponse } from "next/server";
import { generateColorHarmony } from "@/lib/colors/harmonyCalculator";
import type { HarmonyType } from "@/lib/colors/harmonyCalculator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baseColor, harmony } = body;

    if (!baseColor) {
      return NextResponse.json(
        { error: "Base color is required" },
        { status: 400 }
      );
    }

    const harmonyType = (harmony || "complementary") as HarmonyType;

    const palette = generateColorHarmony(baseColor, harmonyType);

    return NextResponse.json({
      success: true,
      palette,
    });
  } catch (error) {
    console.error("Color harmony generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate color harmony",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
