"use client";

interface GlobalHeaderPreviewProps {
  logoUrl?: string;
  siteName?: string;
  menuItems?: string[];
  viewports?: string[];
}

// Viewport configurations with actual pixel widths
const VIEWPORT_CONFIG: Record<string, { name: string; width: number; scale: number }> = {
  "widescreen": { name: "Widescreen", width: 2400, scale: 0.3 },
  "desktop": { name: "Desktop", width: 1920, scale: 0.38 },
  "laptop": { name: "Laptop", width: 1366, scale: 0.53 },
  "tablet-landscape": { name: "Tablet Landscape", width: 1200, scale: 0.6 },
  "tablet-portrait": { name: "Tablet Portrait", width: 1024, scale: 0.7 },
  "mobile-landscape": { name: "Mobile Landscape", width: 880, scale: 0.82 },
  "mobile-portrait": { name: "Mobile Portrait", width: 767, scale: 0.94 },
};

export default function GlobalHeaderPreview({
  logoUrl,
  siteName = "Your Company",
  menuItems = ["Services", "Industries", "About"],
  viewports = ["desktop", "laptop", "tablet-portrait", "mobile-portrait"],
}: GlobalHeaderPreviewProps) {
  // Render a single header at a specific viewport width
  const renderHeader = (viewportId: string) => {
    const config = VIEWPORT_CONFIG[viewportId];
    if (!config) return null;

    const { width, scale } = config;
    const scaledWidth = width * scale;
    const isMobile = viewportId.includes("mobile");
    const isTablet = viewportId.includes("tablet");

    return (
      <div key={viewportId} className="mb-6 last:mb-0">
        {/* Viewport Label */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">{config.name}</h3>
          <span className="text-xs text-gray-500">{width}px</span>
        </div>

        {/* Header Preview Container */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-4 flex justify-center">
          <div
            className="border border-gray-300 rounded overflow-hidden shadow-sm"
            style={{ width: `${scaledWidth}px` }}
          >
            <header
              className="flex items-center justify-between py-3"
              style={{
                backgroundColor: "#0a0a0a",
                paddingLeft: isMobile ? "12px" : "24px",
                paddingRight: isMobile ? "12px" : "24px",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: `${width}px`,
                height: isMobile ? "56px" : "64px",
              }}
            >
              {/* Logo */}
              <div className="flex items-center flex-shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Site logo"
                    className="object-contain"
                    style={{
                      filter: "brightness(0) invert(1)",
                      height: isMobile ? "24px" : "32px",
                      width: "auto",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span
                  className={`font-bold text-white ${logoUrl ? 'hidden' : ''}`}
                  style={{
                    letterSpacing: '0.05em',
                    fontSize: isMobile ? "16px" : "20px",
                  }}
                >
                  {siteName.toUpperCase()}
                </span>
              </div>

              {/* Navigation - Hide on mobile */}
              {!isMobile && (
                <nav className="flex items-center" style={{ gap: isTablet ? "16px" : "24px" }}>
                  {menuItems.map((item, index) => (
                    <span
                      key={index}
                      className="text-white font-medium hover:text-gray-300 cursor-pointer transition-colors whitespace-nowrap"
                      style={{ fontSize: isTablet ? "14px" : "15px" }}
                    >
                      {item}
                    </span>
                  ))}

                  {/* CTA Button */}
                  <button
                    className="rounded-full border-2 text-white font-medium hover:bg-cyan-500 hover:border-cyan-500 transition-all whitespace-nowrap"
                    style={{
                      borderColor: "#00bcd4",
                      fontSize: isTablet ? "13px" : "15px",
                      padding: isTablet ? "6px 16px" : "8px 24px",
                    }}
                  >
                    Get in touch
                  </button>
                </nav>
              )}

              {/* Mobile Menu Icon */}
              {isMobile && (
                <button className="text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
            </header>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Global Header Preview</h2>
      <p className="text-sm text-gray-500 mb-6">
        Preview of your global header across selected viewports. This will appear at the top of every page.
      </p>

      {/* Render header for each selected viewport */}
      <div className="space-y-6">
        {viewports.map(viewportId => renderHeader(viewportId))}
      </div>
    </div>
  );
}
