"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

export default function ConfigurePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && projectId) {
      fetchProject();
    }
  }, [status, projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error("Failed to load project");
      }
      const data = await response.json();
      setProject(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading project...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error || "Project not found"}</p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
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
              onClick={() => router.push("/dashboard")}
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Configure Design
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Project Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Project Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Website URL</p>
              <p className="font-medium text-gray-900 truncate">{project.url}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Site Type</p>
              <p className="font-medium text-gray-900 capitalize">{project.siteType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Industry</p>
              <p className="font-medium text-gray-900 capitalize">{project.industry || "Detecting..."}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Logo Colors</p>
              <div className="flex gap-1 mt-1">
                {project.logoColors && project.logoColors.length > 0 ? (
                  project.logoColors.slice(0, 5).map((color: string, i: number) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">None extracted</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Sections */}
        <div className="space-y-8">
          {/* Viewport Selection */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Viewport Selection</h2>
            <p className="text-gray-600 mb-6">
              Select which device breakpoints to generate designs for (Elementor breakpoints)
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Coming soon:</strong> Viewport selector component
              </p>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Color Scheme</h2>
            <p className="text-gray-600 mb-6">
              Configure your color palette (auto-generated from logo or custom)
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Coming soon:</strong> Color picker component
              </p>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Typography</h2>
            <p className="text-gray-600 mb-6">
              Select fonts from Google Fonts (AI-recommended or custom)
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Coming soon:</strong> Font selector component
              </p>
            </div>
          </div>

          {/* Widgets */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Layout Widgets</h2>
            <p className="text-gray-600 mb-6">
              Select Elementor widgets to include in your design
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Coming soon:</strong> Widget selector component
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Save & Exit
          </Button>
          <Button
            onClick={() => alert("Generate Designs feature coming in Phase 3!")}
          >
            Generate Designs
          </Button>
        </div>
      </main>
    </div>
  );
}
