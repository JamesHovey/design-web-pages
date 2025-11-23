"use client";

import { useState, useEffect } from "react";
import Checkbox from "@/components/ui/Checkbox";

interface Viewport {
  id: string;
  name: string;
  width: string;
  defaultChecked: boolean;
}

const VIEWPORTS: Viewport[] = [
  { id: "widescreen", name: "Widescreen", width: "2400px+", defaultChecked: false },
  { id: "desktop", name: "Desktop", width: "up to 1920px", defaultChecked: true },
  { id: "laptop", name: "Laptop", width: "1366px+", defaultChecked: true },
  { id: "tablet-landscape", name: "Tablet Landscape", width: "up to 1200px", defaultChecked: false },
  { id: "tablet-portrait", name: "Tablet Portrait", width: "up to 1024px", defaultChecked: true },
  { id: "mobile-landscape", name: "Mobile Landscape", width: "up to 880px", defaultChecked: false },
  { id: "mobile-portrait", name: "Mobile Portrait", width: "up to 767px", defaultChecked: true },
];

interface ViewportSelectorProps {
  value?: string[];
  onChange?: (viewports: string[]) => void;
}

export default function ViewportSelector({ value, onChange }: ViewportSelectorProps) {
  const [selectedViewports, setSelectedViewports] = useState<string[]>(
    value || VIEWPORTS.filter((v) => v.defaultChecked).map((v) => v.id)
  );

  useEffect(() => {
    if (value) {
      setSelectedViewports(value);
    }
  }, [value]);

  const handleChange = (viewportId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedViewports, viewportId]
      : selectedViewports.filter((id) => id !== viewportId);

    setSelectedViewports(newSelection);
    onChange?.(newSelection);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Select which device breakpoints to generate designs for. These match Elementor Pro breakpoints exactly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VIEWPORTS.map((viewport) => (
          <div
            key={viewport.id}
            className={cn(
              "border rounded-lg p-4 transition-colors",
              selectedViewports.includes(viewport.id)
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white"
            )}
          >
            <Checkbox
              id={viewport.id}
              label={viewport.name}
              checked={selectedViewports.includes(viewport.id)}
              onChange={(e) => handleChange(viewport.id, e.target.checked)}
            />
            <p className="ml-6 mt-1 text-xs text-gray-500">{viewport.width}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-800">
          <strong>Selected:</strong> {selectedViewports.length} viewport
          {selectedViewports.length !== 1 ? "s" : ""}
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Default: Desktop, Laptop, Tablet Portrait, Mobile Portrait
        </p>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
