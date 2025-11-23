"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface CompetitorAnalysis {
  url: string;
  analysis?: {
    designStyle?: string;
    colorPalette?: string[];
    typography?: string;
    layoutApproach?: string;
    uniqueFeatures?: string[];
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
  };
  error?: string;
}

interface CompetitorResearchProps {
  projectId: string;
  value?: CompetitorAnalysis[];
  onChange?: (competitors: CompetitorAnalysis[]) => void;
}

export default function CompetitorResearch({ projectId, value = [], onChange }: CompetitorResearchProps) {
  const [competitorUrls, setCompetitorUrls] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>(value);

  const handleResearch = async () => {
    setLoading(true);
    setError("");

    try {
      const urls = competitorUrls
        .split("\n")
        .map(url => url.trim())
        .filter(url => url.length > 0);

      if (urls.length === 0) {
        setError("Please enter at least one competitor URL");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/competitors/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          competitorUrls: urls,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to research competitors");
      }

      const data = await response.json();
      setCompetitors(data.competitors);
      onChange?.(data.competitors);
      setCompetitorUrls("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to research competitors");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Competitor URLs (one per line, max 5)
          </label>
          <textarea
            value={competitorUrls}
            onChange={(e) => setCompetitorUrls(e.target.value)}
            placeholder="https://competitor1.com&#10;https://competitor2.com&#10;https://competitor3.com"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <Button onClick={handleResearch} disabled={loading}>
          {loading ? "Analyzing Competitors..." : "Research Competitors"}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {competitors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Competitor Analysis</h3>

          <div className="grid grid-cols-1 gap-4">
            {competitors.map((competitor, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6 bg-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{competitor.url}</h4>
                    {competitor.analysis?.designStyle && (
                      <p className="text-sm text-gray-600 mt-1">
                        Style: {competitor.analysis.designStyle}
                      </p>
                    )}
                  </div>
                  {competitor.error && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      Error
                    </span>
                  )}
                </div>

                {competitor.analysis && !competitor.error && (
                  <div className="space-y-3 text-sm">
                    {competitor.analysis.colorPalette && competitor.analysis.colorPalette.length > 0 && (
                      <div>
                        <strong className="text-gray-700">Colors:</strong>
                        <div className="flex gap-2 mt-1">
                          {competitor.analysis.colorPalette.map((color, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded border border-gray-300"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {competitor.analysis.layoutApproach && (
                      <div>
                        <strong className="text-gray-700">Layout:</strong>
                        <span className="ml-2 text-gray-600">{competitor.analysis.layoutApproach}</span>
                      </div>
                    )}

                    {competitor.analysis.uniqueFeatures && competitor.analysis.uniqueFeatures.length > 0 && (
                      <div>
                        <strong className="text-gray-700">Unique Features:</strong>
                        <ul className="list-disc list-inside text-gray-600 ml-2 mt-1">
                          {competitor.analysis.uniqueFeatures.map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {competitor.analysis.recommendations && competitor.analysis.recommendations.length > 0 && (
                      <div>
                        <strong className="text-gray-700">Differentiation Strategy:</strong>
                        <ul className="list-disc list-inside text-gray-600 ml-2 mt-1">
                          {competitor.analysis.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {competitor.error && (
                  <p className="text-sm text-red-600">{competitor.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Claude AI will analyze competitor websites to identify design patterns,
          strengths, and opportunities for differentiation. Analysis is cached for 7 days.
        </p>
      </div>
    </div>
  );
}
