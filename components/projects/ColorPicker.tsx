"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";

type HarmonyType =
  | "complementary"
  | "split-complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "monochromatic";

interface ColorScheme {
  colors: string[];
  harmony: HarmonyType;
  extractFromLogo: boolean;
}

interface ColorPickerProps {
  value?: ColorScheme;
  logoColors?: string[];
  onChange?: (scheme: ColorScheme) => void;
}

export default function ColorPicker({ value, logoColors = [], onChange }: ColorPickerProps) {
  const [mode, setMode] = useState<"auto" | "custom">("auto");
  const [extractFromLogo, setExtractFromLogo] = useState(logoColors.length > 0);
  const [harmony, setHarmony] = useState<HarmonyType>("complementary");
  const [colors, setColors] = useState<string[]>(
    value?.colors || logoColors || ["#3B82F6", "#10B981", "#F59E0B"]
  );
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (value) {
      setColors(value.colors);
      setHarmony(value.harmony);
      setExtractFromLogo(value.extractFromLogo);
    }
  }, [value]);

  const handleGenerateColors = async () => {
    setGenerating(true);
    try {
      const baseColor = extractFromLogo && logoColors.length > 0 ? logoColors[0] : colors[0];

      const response = await fetch("/api/colors/harmonize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseColor, harmony }),
      });

      const data = await response.json();

      if (data.success) {
        setColors(data.palette.colors);
        onChange?.({
          colors: data.palette.colors,
          harmony,
          extractFromLogo,
        });
      }
    } catch (error) {
      console.error("Failed to generate colors:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleModeChange = (newMode: "auto" | "custom") => {
    setMode(newMode);
    if (newMode === "auto" && logoColors.length > 0) {
      setExtractFromLogo(true);
    }
  };

  const handleAddColor = () => {
    const newColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    const newColors = [...colors, newColor];
    setColors(newColors);
    onChange?.({ colors: newColors, harmony, extractFromLogo });
  };

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
    onChange?.({ colors: newColors, harmony, extractFromLogo });
  };

  const handleRemoveColor = (index: number) => {
    if (colors.length > 1) {
      const newColors = colors.filter((_, i) => i !== index);
      setColors(newColors);
      onChange?.({ colors: newColors, harmony, extractFromLogo });
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <Button
          variant={mode === "auto" ? "primary" : "outline"}
          onClick={() => handleModeChange("auto")}
          size="sm"
        >
          Auto Mode
        </Button>
        <Button
          variant={mode === "custom" ? "primary" : "outline"}
          onClick={() => handleModeChange("custom")}
          size="sm"
        >
          Custom Mode
        </Button>
      </div>

      {/* Auto Mode */}
      {mode === "auto" && (
        <div className="space-y-4">
          {logoColors.length > 0 && (
            <div>
              <Checkbox
                id="extract-from-logo"
                label="Extract colors from logo"
                checked={extractFromLogo}
                onChange={(e) => {
                  setExtractFromLogo(e.target.checked);
                  onChange?.({ colors, harmony, extractFromLogo: e.target.checked });
                }}
              />
              {extractFromLogo && (
                <div className="ml-6 mt-2 flex gap-2">
                  {logoColors.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harmony Strategy
            </label>
            <select
              value={harmony}
              onChange={(e) => {
                const newHarmony = e.target.value as HarmonyType;
                setHarmony(newHarmony);
                onChange?.({ colors, harmony: newHarmony, extractFromLogo });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="complementary">Complementary (default)</option>
              <option value="split-complementary">Split-Complementary</option>
              <option value="analogous">Analogous</option>
              <option value="triadic">Triadic</option>
              <option value="tetradic">Tetradic</option>
              <option value="monochromatic">Monochromatic</option>
            </select>
          </div>

          <Button onClick={handleGenerateColors} disabled={generating} className="w-full">
            {generating ? "Generating..." : "Generate Color Palette"}
          </Button>
        </div>
      )}

      {/* Custom Mode */}
      {mode === "custom" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Add custom colors and reorder them by priority.
          </p>
          <div className="space-y-2">
            {colors.map((color, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#000000"
                />
                {colors.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveColor(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button onClick={handleAddColor} variant="outline" className="w-full">
            + Add Color
          </Button>
        </div>
      )}

      {/* Color Palette Preview */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Color Palette Preview</h4>
        <div className="flex flex-wrap gap-3">
          {colors.map((color, index) => (
            <div key={index} className="text-center">
              <div
                className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <p className="text-xs text-gray-600 mt-1 font-mono">{color}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility Check Preview */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Accessibility Check:</strong> Contrast ratios will be validated against WCAG AA/AAA standards.
        </p>
      </div>
    </div>
  );
}
