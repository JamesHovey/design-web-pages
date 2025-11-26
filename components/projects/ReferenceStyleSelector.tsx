"use client";

import { useState } from "react";

export interface ReferenceStyleConfig {
  mode: "all" | "random" | "industry-matched" | "curated" | "custom";
  count?: number;
  customFiles?: string[];
}

interface ReferenceStyleSelectorProps {
  value: ReferenceStyleConfig;
  onChange: (config: ReferenceStyleConfig) => void;
}

export default function ReferenceStyleSelector({ value, onChange }: ReferenceStyleSelectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const modes = [
    {
      id: "industry-matched" as const,
      name: "Industry-Matched",
      description: "AI selects the most relevant reference designs based on your industry (Recommended)",
      icon: "🎯",
      recommended: true,
    },
    {
      id: "random" as const,
      name: "Random Selection",
      description: "Randomly select designs for maximum creative variety",
      icon: "🎲",
      recommended: false,
    },
    {
      id: "curated" as const,
      name: "Curated Collection",
      description: "Use our hand-picked selection of 10 professional designs",
      icon: "⭐",
      recommended: false,
    },
    {
      id: "all" as const,
      name: "All Designs",
      description: "Use all 59 reference designs for maximum inspiration",
      icon: "🌟",
      recommended: false,
    },
  ];

  const handleModeChange = (mode: ReferenceStyleConfig["mode"]) => {
    onChange({
      ...value,
      mode,
    });
  };

  const handleCountChange = (count: number) => {
    onChange({
      ...value,
      count,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Reference Style Selection</h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose how AI selects reference designs to inspire your layout
          </p>
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id)}
            className={`relative p-4 rounded-lg border-2 text-left transition-all ${
              value.mode === mode.id
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            {/* Recommended Badge */}
            {mode.recommended && (
              <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                RECOMMENDED
              </span>
            )}

            {/* Mode Icon & Title */}
            <div className="flex items-start gap-3 mb-2">
              <span className="text-3xl">{mode.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{mode.name}</h4>
                <p className="text-sm text-gray-600">{mode.description}</p>
              </div>
            </div>

            {/* Selection Indicator */}
            {value.mode === mode.id && (
              <div className="mt-3 flex items-center gap-2 text-blue-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Selected</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Random Mode Options */}
      {value.mode === "random" && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Number of Random References
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="30"
              value={value.count || 10}
              onChange={(e) => handleCountChange(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-bold text-gray-900 w-12 text-center">
              {value.count || 10}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Selecting more references gives AI more variety but may increase generation time
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">How Reference Selection Works</h4>
            <p className="text-sm text-blue-800">
              AI analyzes the selected reference designs to understand professional patterns, layouts, and styling.
              It then creates unique variations tailored to your brand while maintaining industry best practices.
              The references are for inspiration only - your designs will be completely original.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
