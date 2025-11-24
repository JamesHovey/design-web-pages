"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import ViewportSelector from "@/components/projects/ViewportSelector";
import ColorPicker from "@/components/projects/ColorPicker";
import FontSelector from "@/components/projects/FontSelector";
import WidgetSelector from "@/components/projects/WidgetSelector";
import CompetitorResearch from "@/components/projects/CompetitorResearch";
import MediaUpload from "@/components/projects/MediaUpload";

export default function ConfigurePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Configuration state
  const [viewports, setViewports] = useState<string[]>([]);
  const [colorScheme, setColorScheme] = useState<any>(null);
  const [fonts, setFonts] = useState<any>(null);
  const [layoutWidgets, setLayoutWidgets] = useState<string[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);

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

      // Initialize configuration state from project data
      setViewports(data.project.viewports || []);
      setColorScheme(data.project.colorScheme || null);
      setFonts(data.project.fonts || null);
      setLayoutWidgets(data.project.layoutWidgets || []);
      setCompetitors(data.project.competitors || []);
      setMedia(data.project.media || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          viewports,
          colorScheme,
          fonts,
          layoutWidgets,
          competitors,
          media,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save configuration");
      }

      setSuccessMessage("Configuration saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    await handleSave();
    router.push("/dashboard");
  };

  const handleGenerateDesigns = async () => {
    setGenerating(true);
    setError("");

    try {
      // Save configuration first
      await handleSave();

      // Generate designs
      const response = await fetch("/api/designs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate designs");
      }

      const data = await response.json();

      // Redirect to designs gallery
      router.push(`/projects/${projectId}/designs`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate designs");
    } finally {
      setGenerating(false);
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
    router.push("/login");
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

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Configuration Sections */}
        <div className="space-y-8">
          {/* Viewport Selection */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Viewport Selection</h2>
            <p className="text-gray-600 mb-6">
              Select which device breakpoints to generate designs for (Elementor breakpoints)
            </p>
            <ViewportSelector value={viewports} onChange={setViewports} />
          </div>

          {/* Color Scheme */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Color Scheme</h2>
            <p className="text-gray-600 mb-6">
              Configure your color palette (auto-generated from logo or custom)
            </p>
            <ColorPicker
              value={colorScheme}
              logoColors={project.logoColors}
              onChange={setColorScheme}
            />
          </div>

          {/* Typography */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Typography</h2>
            <p className="text-gray-600 mb-6">
              Select fonts from Google Fonts (AI-recommended or custom)
            </p>
            <FontSelector
              value={fonts}
              industry={project.industry}
              onChange={setFonts}
            />
          </div>

          {/* Widgets */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Layout Widgets</h2>
            <p className="text-gray-600 mb-6">
              Select Elementor widgets to include in your design
            </p>
            <WidgetSelector
              value={layoutWidgets}
              siteType={project.siteType}
              onChange={setLayoutWidgets}
            />
          </div>

          {/* Competitor Research */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Competitor Research</h2>
            <p className="text-gray-600 mb-6">
              Analyze competitor websites to identify design opportunities and differentiation strategies
            </p>
            <CompetitorResearch
              projectId={projectId}
              value={competitors}
              onChange={setCompetitors}
            />
          </div>

          {/* Media Assets */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Media Assets</h2>
            <p className="text-gray-600 mb-6">
              Add images and videos to be referenced in your AI-generated designs
            </p>
            <MediaUpload
              value={media}
              onChange={setMedia}
              industry={project.industry}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={saving}
          >
            Cancel
          </Button>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
            <Button
              onClick={handleSaveAndExit}
              disabled={saving}
            >
              Save & Exit
            </Button>
            <Button
              onClick={handleGenerateDesigns}
              disabled={saving || generating}
            >
              {generating ? "Generating Designs..." : "Generate Designs"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
