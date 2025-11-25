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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProgress("Scraping website...");

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
        throw new Error(data.error || "Failed to scrape website");
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
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {progress && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {progress}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? progress || "Analyzing website..." : "Analyze & Continue"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
