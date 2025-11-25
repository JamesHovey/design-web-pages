"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useState } from "react";

export default function NewProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [needsManualUpload, setNeedsManualUpload] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const normalizeUrl = (inputUrl: string): string => {
    let normalized = inputUrl.trim();

    // Remove trailing slashes
    normalized = normalized.replace(/\/+$/, "");

    // If no protocol, add https://
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = `https://${normalized}`;
    }

    // Parse and reconstruct URL to ensure it's valid
    try {
      const urlObj = new URL(normalized);

      // Remove trailing slash from pathname if present
      if (urlObj.pathname.endsWith('/') && urlObj.pathname.length > 1) {
        urlObj.pathname = urlObj.pathname.slice(0, -1);
      }

      return urlObj.toString();
    } catch (e) {
      // If URL parsing fails, return the normalized string anyway
      // The API will handle the validation
      return normalized;
    }
  };

  const handleScreenshotUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) {
      setError("Please select a screenshot to upload");
      return;
    }

    setLoading(true);
    setError("");
    setProgress("Analyzing screenshot...");

    try {
      // Normalize the URL
      const normalizedUrl = normalizeUrl(url);

      // Convert screenshot to base64
      const reader = new FileReader();
      reader.readAsDataURL(screenshot);

      await new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = reject;
      });

      const base64Screenshot = reader.result as string;

      // Send to screenshot analysis API
      const response = await fetch("/api/scrape/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalizedUrl,
          screenshot: base64Screenshot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze screenshot");
      }

      setProgress("Analysis complete! Redirecting...");

      // Redirect to configuration page
      setTimeout(() => {
        router.push(`/projects/${data.project.id}/configure`);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
      setProgress("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProgress("Scraping website...");
    setNeedsManualUpload(false);

    try {
      // Normalize the URL before sending
      const normalizedUrl = normalizeUrl(url);

      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if manual upload is needed
        if (data.needsManualUpload) {
          setNeedsManualUpload(true);
          setError(data.message || "Website blocks automated access. Please upload a screenshot instead.");
          setLoading(false);
          setProgress("");
          return;
        }

        // Use the detailed error message from the API
        const errorMessage = data.message || data.error || "Failed to scrape website";
        throw new Error(errorMessage);
      }

      setProgress("Analysis complete! Redirecting...");

      // Redirect to configuration page
      setTimeout(() => {
        router.push(`/projects/${data.project.id}/configure`);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                ← Back to Dashboard
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Redesign Existing Website
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Enter Website URL
            </h2>
            <p className="text-gray-600">
              Provide the URL of the existing website you'd like to redesign. We'll analyze the content, structure, and competitors to generate distinctive design variations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Website URL"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com or https://www.example.com"
              required
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Automatic content and structure extraction</li>
                <li>Site classification (E-commerce vs Lead Generation)</li>
                <li>Logo color extraction</li>
                <li>Competitor research and analysis</li>
                <li>Industry detection</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="font-semibold mb-1">Error</div>
                <div className="text-sm">{error}</div>
              </div>
            )}

            {needsManualUpload && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Upload a Screenshot Instead
                    </h3>
                    <p className="text-sm text-blue-800 mb-4">
                      This website blocks automated access. No problem! Take a screenshot of the site and upload it here.
                      Our AI will analyze the design, colors, layout, and content from your screenshot.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                          Upload Screenshot (PNG, JPG, or WebP)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                        />
                        {screenshot && (
                          <p className="mt-2 text-sm text-green-700">
                            ✓ {screenshot.name} ({(screenshot.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </div>

                      <div className="bg-blue-100 p-3 rounded text-sm text-blue-800">
                        <strong>Tips for best results:</strong>
                        <ul className="list-disc list-inside mt-1 ml-2 space-y-1">
                          <li>Capture the full homepage (scroll to include all sections)</li>
                          <li>Use desktop view for best analysis</li>
                          <li>Ensure text is readable and colors are accurate</li>
                          <li>Include the header, hero section, and main content</li>
                        </ul>
                      </div>

                      <Button
                        onClick={handleScreenshotUpload}
                        disabled={!screenshot || loading}
                        className="w-full"
                      >
                        {loading ? "Analyzing Screenshot..." : "Analyze Screenshot & Continue"}
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          setNeedsManualUpload(false);
                          setScreenshot(null);
                          setError("");
                        }}
                        className="w-full text-sm text-blue-700 hover:text-blue-900 underline"
                      >
                        ← Try automatic scraping again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {progress && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {progress}
              </div>
            )}

            {!needsManualUpload && (
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? progress || "Analyzing website..." : "Analyze & Continue"}
              </Button>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
