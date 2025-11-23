"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";

interface FontConfig {
  primary: string;
  secondary: string;
  accent?: string;
  button?: string;
  form?: string;
  nav?: string;
}

interface FontSelectorProps {
  value?: FontConfig;
  industry?: string;
  onChange?: (fonts: FontConfig) => void;
}

// Popular Google Fonts (subset for now - full integration needs Google Fonts API)
const POPULAR_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Source Sans Pro",
  "Raleway",
  "Nunito",
  "Playfair Display",
  "Merriweather",
  "Crimson Text",
  "Lora",
  "PT Serif",
  "DM Sans",
  "Work Sans",
  "Outfit",
  "Space Grotesk",
];

// AI-recommended fonts by industry
const INDUSTRY_FONTS: Record<string, FontConfig> = {
  legal: {
    primary: "Playfair Display",
    secondary: "Lato",
    accent: "Crimson Text",
    button: "Lato",
    form: "Inter",
    nav: "Lato",
  },
  fashion: {
    primary: "Montserrat",
    secondary: "Lora",
    accent: "Playfair Display",
    button: "Montserrat",
    form: "Inter",
    nav: "Montserrat",
  },
  saas: {
    primary: "Inter",
    secondary: "Inter",
    accent: "DM Sans",
    button: "Inter",
    form: "Inter",
    nav: "Inter",
  },
  restaurant: {
    primary: "Playfair Display",
    secondary: "Open Sans",
    accent: "Merriweather",
    button: "Open Sans",
    form: "Inter",
    nav: "Open Sans",
  },
  healthcare: {
    primary: "Poppins",
    secondary: "Open Sans",
    accent: "Nunito",
    button: "Poppins",
    form: "Inter",
    nav: "Poppins",
  },
  default: {
    primary: "Inter",
    secondary: "Inter",
    accent: "DM Sans",
    button: "Inter",
    form: "Inter",
    nav: "Inter",
  },
};

export default function FontSelector({ value, industry, onChange }: FontSelectorProps) {
  const defaultFonts = INDUSTRY_FONTS[industry || "default"] || INDUSTRY_FONTS.default;
  const [fonts, setFonts] = useState<FontConfig>(value || defaultFonts);
  const [useAI, setUseAI] = useState(true);

  useEffect(() => {
    if (value) {
      setFonts(value);
    }
  }, [value]);

  const handleFontChange = (key: keyof FontConfig, newFont: string) => {
    const newFonts = { ...fonts, [key]: newFont };
    setFonts(newFonts);
    onChange?.(newFonts);
  };

  const handleUseAI = (use: boolean) => {
    setUseAI(use);
    if (use) {
      const recommended = INDUSTRY_FONTS[industry || "default"] || INDUSTRY_FONTS.default;
      setFonts(recommended);
      onChange?.(recommended);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Recommendation Toggle */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div>
          <p className="text-sm font-medium text-blue-900">
            Use AI-Recommended Fonts
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Based on {industry || "general"} industry best practices
          </p>
        </div>
        <button
          onClick={() => handleUseAI(!useAI)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${useAI ? "bg-blue-600" : "bg-gray-200"}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${useAI ? "translate-x-6" : "translate-x-1"}
            `}
          />
        </button>
      </div>

      {/* Font Selection */}
      <div className="space-y-4">
        {/* Primary Font (Headings) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Font (Headings)
          </label>
          <select
            value={fonts.primary}
            onChange={(e) => handleFontChange("primary", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={useAI}
            style={{ fontFamily: fonts.primary }}
          >
            {POPULAR_FONTS.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Secondary Font (Body) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Font (Body Text)
          </label>
          <select
            value={fonts.secondary}
            onChange={(e) => handleFontChange("secondary", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={useAI}
            style={{ fontFamily: fonts.secondary }}
          >
            {POPULAR_FONTS.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Accent Font */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accent Font (Optional)
          </label>
          <select
            value={fonts.accent || ""}
            onChange={(e) => handleFontChange("accent", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={useAI}
            style={{ fontFamily: fonts.accent }}
          >
            <option value="">None</option>
            {POPULAR_FONTS.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Use Cases */}
        <details className="border border-gray-200 rounded-lg">
          <summary className="cursor-pointer p-4 font-medium text-gray-700 hover:bg-gray-50">
            Specific Use Cases (Optional)
          </summary>
          <div className="p-4 space-y-4 border-t border-gray-200">
            {/* Button Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text Font
              </label>
              <select
                value={fonts.button || fonts.primary}
                onChange={(e) => handleFontChange("button", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={useAI}
              >
                {POPULAR_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Form Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Field Font
              </label>
              <select
                value={fonts.form || fonts.secondary}
                onChange={(e) => handleFontChange("form", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={useAI}
              >
                {POPULAR_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Navigation Font
              </label>
              <select
                value={fonts.nav || fonts.primary}
                onChange={(e) => handleFontChange("nav", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={useAI}
              >
                {POPULAR_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </details>
      </div>

      {/* Font Preview */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Font Preview</h4>

        <div style={{ fontFamily: fonts.primary }}>
          <p className="text-3xl font-bold text-gray-900">
            Heading Example
          </p>
          <p className="text-sm text-gray-500 mt-1">{fonts.primary}</p>
        </div>

        <div style={{ fontFamily: fonts.secondary }} className="pt-2">
          <p className="text-base text-gray-700 leading-relaxed">
            This is how body text will look in your design. The quick brown fox jumps over the lazy dog.
          </p>
          <p className="text-sm text-gray-500 mt-1">{fonts.secondary}</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Full Google Fonts API integration coming soon. Currently showing popular font selections.
        </p>
      </div>
    </div>
  );
}
