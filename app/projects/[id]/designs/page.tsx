"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

interface Design {
  id: string;
  name: string;
  description: string;
  htmlPreview: string;
  accessibilityScore: number;
  distinctivenessScore: number;
  estimatedBuildTime: number;
  rationale: string;
  ctaStrategy: string;
  qualityIssues: string[];
  qualityStrengths: string[];
  approved: boolean;
}

export default function DesignsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [project, setProject] = useState<any>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [selectedViewport, setSelectedViewport] = useState<string>("desktop");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && projectId) {
      fetchDesigns();
    }
  }, [status, projectId]);

  const fetchDesigns = async () => {
    try {
      // Fetch project
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (!projectResponse.ok) {
        throw new Error("Failed to load project");
      }
      const projectData = await projectResponse.json();
      setProject(projectData.project);

      // Fetch designs
      const designsResponse = await fetch(`/api/projects/${projectId}/designs`);
      if (!designsResponse.ok) {
        throw new Error("Failed to load designs");
      }
      const designsData = await designsResponse.json();
      setDesigns(designsData.designs);

      // Auto-select first design
      if (designsData.designs.length > 0) {
        setSelectedDesign(designsData.designs[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load designs");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (designId: string) => {
    try {
      const response = await fetch(`/api/designs/${designId}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to approve design");
      }

      // Refresh designs
      await fetchDesigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve design");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading designs...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  if (error || designs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error || "No designs found"}</p>
          <Button onClick={() => router.push(`/projects/${projectId}/configure`)}>
            Back to Configuration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/projects/${projectId}/configure`)}
            >
              ← Back to Configuration
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Design Variations</h1>
              <p className="text-sm text-gray-600">{project?.url}</p>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Design Cards */}
          {designs.map((design) => (
            <div
              key={design.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all ${
                selectedDesign?.id === design.id
                  ? "ring-4 ring-blue-500"
                  : "hover:shadow-xl"
              }`}
              onClick={() => setSelectedDesign(design)}
            >
              {/* Design Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{design.name}</h3>
                  {design.approved && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      Approved
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{design.description}</p>
              </div>

              {/* Screenshot Preview */}
              {design.screenshots && Object.keys(design.screenshots).length > 0 && (
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img
                    src={design.screenshots['desktop'] || design.screenshots[Object.keys(design.screenshots)[0]]}
                    alt={`${design.name} preview`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              )}

              {/* Scores */}
              <div className="p-6 bg-gray-50 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Accessibility</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          design.accessibilityScore >= 80
                            ? "bg-green-500"
                            : design.accessibilityScore >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${design.accessibilityScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {design.accessibilityScore}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Distinctiveness</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          design.distinctivenessScore >= 80
                            ? "bg-green-500"
                            : design.distinctivenessScore >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${design.distinctivenessScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {design.distinctivenessScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="p-6">
                <p className="text-xs text-gray-600">
                  Estimated Build Time: {design.estimatedBuildTime} minutes
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Design Details */}
        {selectedDesign && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedDesign.name} Details
              </h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.open(`/api/designs/${selectedDesign.id}/export/pdf`, '_blank')}
                >
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`/api/designs/${selectedDesign.id}/export/elementor`, '_blank')}
                >
                  Export Elementor JSON
                </Button>
                <Button onClick={() => handleApprove(selectedDesign.id)}>
                  Approve Design
                </Button>
              </div>
            </div>

            {/* Design Rationale */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Design Rationale</h3>
              <p className="text-gray-700">{selectedDesign.rationale}</p>
            </div>

            {/* CTA Strategy */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">CTA Strategy</h3>
              <p className="text-gray-700">{selectedDesign.ctaStrategy}</p>
            </div>

            {/* Quality Strengths */}
            {selectedDesign.qualityStrengths.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quality Strengths
                </h3>
                <ul className="list-disc list-inside text-gray-700">
                  {selectedDesign.qualityStrengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quality Issues */}
            {selectedDesign.qualityIssues.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Areas for Improvement</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {selectedDesign.qualityIssues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Viewport Screenshots */}
            {selectedDesign.screenshots && Object.keys(selectedDesign.screenshots).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Screenshots</h3>

                {/* Viewport Tabs */}
                <div className="flex gap-2 mb-4">
                  {Object.keys(selectedDesign.screenshots).map((viewport) => (
                    <button
                      key={viewport}
                      onClick={() => setSelectedViewport(viewport)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedViewport === viewport
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {viewport.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>

                {/* Screenshot Display */}
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 p-4">
                  <img
                    src={selectedDesign.screenshots[selectedViewport]}
                    alt={`${selectedDesign.name} - ${selectedViewport}`}
                    className="w-full h-auto shadow-lg"
                  />
                </div>
              </div>
            )}

            {/* HTML Preview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">HTML Preview</h3>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <iframe
                  srcDoc={selectedDesign.htmlPreview}
                  className="w-full h-96"
                  title={`${selectedDesign.name} Preview`}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
