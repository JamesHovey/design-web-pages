"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useState, useEffect, useRef } from "react";

export default function NewProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [needsManualUpload, setNeedsManualUpload] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  // Auto-detection states
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState({
    scraping: false,
    siteType: false,
    industry: false,
    logoColors: false,
  });
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-detect when valid URL is entered
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset validation state
    setIsValidUrl(false);

    // Don't process if URL is empty or already loading
    if (!url.trim() || loading) {
      return;
    }

    // Debounce URL validation (wait 800ms after user stops typing)
    debounceTimerRef.current = setTimeout(() => {
      validateAndStartDetection();
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [url]);

  const validateAndStartDetection = () => {
    const normalizedUrl = normalizeUrl(url);

    // Validate URL
    try {
      const urlObj = new URL(normalizedUrl);
      if (['http:', 'https:'].includes(urlObj.protocol)) {
        setIsValidUrl(true);
        // Automatically start detection
        startAutoDetection(normalizedUrl);
      }
    } catch (e) {
      // Invalid URL, do nothing
      setIsValidUrl(false);
    }
  };

  const startAutoDetection = async (normalizedUrl: string) => {
    setLoading(true);
    setError("");
    setProgress("Analyzing website...");
    setNeedsManualUpload(false);

    // Reset detection status
    setDetectionStatus({
      scraping: false,
      siteType: false,
      industry: false,
      logoColors: false,
    });

    try {
      // Start scraping animation
      setTimeout(() => {
        setDetectionStatus(prev => ({ ...prev, scraping: true }));
      }, 100);

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

        const errorMessage = data.message || data.error || "Failed to scrape website";
        throw new Error(errorMessage);
      }

      // Simulate progressive detection updates
      setTimeout(() => {
        setDetectionStatus(prev => ({ ...prev, siteType: true }));
      }, 300);

      setTimeout(() => {
        setDetectionStatus(prev => ({ ...prev, industry: true }));
      }, 600);

      setTimeout(() => {
        setDetectionStatus(prev => ({ ...prev, logoColors: true }));
      }, 900);

      setProgress("Detection complete! Redirecting...");

      // Redirect to configuration page
      setTimeout(() => {
        router.push(`/projects/${data.project.id}/configure`);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
      setProgress("");
      setDetectionStatus({
        scraping: false,
        siteType: false,
        industry: false,
        logoColors: false,
      });
    }
  };

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
    // Auto-detection handles everything, so form submission is disabled
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

            {/* Detection Progress Indicator */}
            {loading && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-900">
                      Analyzing Website
                    </h3>
                    <p className="text-sm text-blue-700">
                      Automatic detection in progress...
                    </p>
                  </div>
                </div>

                {/* Detection Steps */}
                <div className="space-y-3 pl-11">
                  {/* Scraping */}
                  <div className="flex items-center space-x-3">
                    {detectionStatus.scraping ? (
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin flex-shrink-0"></div>
                    )}
                    <span className={`text-sm font-medium ${detectionStatus.scraping ? 'text-green-700' : 'text-blue-700'}`}>
                      {detectionStatus.scraping ? 'Content extracted' : 'Extracting content...'}
                    </span>
                  </div>

                  {/* Site Type */}
                  <div className="flex items-center space-x-3">
                    {detectionStatus.siteType ? (
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : detectionStatus.scraping ? (
                      <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin flex-shrink-0"></div>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                    )}
                    <span className={`text-sm font-medium ${detectionStatus.siteType ? 'text-green-700' : detectionStatus.scraping ? 'text-blue-700' : 'text-gray-500'}`}>
                      {detectionStatus.siteType ? 'Site type detected' : 'Detecting site type...'}
                    </span>
                  </div>

                  {/* Industry */}
                  <div className="flex items-center space-x-3">
                    {detectionStatus.industry ? (
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : detectionStatus.siteType ? (
                      <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin flex-shrink-0"></div>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                    )}
                    <span className={`text-sm font-medium ${detectionStatus.industry ? 'text-green-700' : detectionStatus.siteType ? 'text-blue-700' : 'text-gray-500'}`}>
                      {detectionStatus.industry ? 'Industry identified' : 'Identifying industry...'}
                    </span>
                  </div>

                  {/* Logo Colors */}
                  <div className="flex items-center space-x-3">
                    {detectionStatus.logoColors ? (
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : detectionStatus.industry ? (
                      <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin flex-shrink-0"></div>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                    )}
                    <span className={`text-sm font-medium ${detectionStatus.logoColors ? 'text-green-700' : detectionStatus.industry ? 'text-blue-700' : 'text-gray-500'}`}>
                      {detectionStatus.logoColors ? 'Logo colors extracted' : 'Extracting logo colors...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  What happens automatically?
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Automatic content and structure extraction</li>
                  <li>Site classification (E-commerce vs Lead Generation)</li>
                  <li>Industry detection using AI</li>
                  <li>Logo color extraction</li>
                </ul>
                <p className="text-xs text-blue-700 mt-3 font-medium">
                  💡 Just enter a valid URL above - detection starts automatically!
                </p>
              </div>
            )}

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

            {progress && !loading && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {progress}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
