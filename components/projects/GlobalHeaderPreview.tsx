"use client";

interface GlobalHeaderPreviewProps {
  logoUrl?: string;
  siteName?: string;
  menuItems?: string[];
}

export default function GlobalHeaderPreview({
  logoUrl,
  siteName = "Your Company",
  menuItems = ["Services", "Industries", "About"],
}: GlobalHeaderPreviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Global Header Preview</h2>

      {/* Header Preview */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <header
          className="flex items-center justify-between px-8 py-4"
          style={{ backgroundColor: "#0a0a0a" }}
        >
          {/* Logo */}
          <div className="flex items-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Site logo"
                className="h-10 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <span
              className={`font-bold text-white text-xl ${logoUrl ? 'hidden' : ''}`}
              style={{ letterSpacing: '0.05em' }}
            >
              {siteName.toUpperCase()}
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            {menuItems.map((item, index) => (
              <span
                key={index}
                className="text-white text-base font-medium hover:text-gray-300 cursor-pointer transition-colors"
              >
                {item}
              </span>
            ))}

            {/* CTA Button */}
            <button
              className="px-6 py-2 rounded-full border-2 text-white font-medium hover:bg-cyan-500 hover:border-cyan-500 transition-all"
              style={{
                borderColor: "#00bcd4",
                fontSize: "15px"
              }}
            >
              Get in touch
            </button>
          </nav>
        </header>
      </div>

      <p className="text-sm text-gray-500 mt-3">
        This is a preview of your global header. It will appear at the top of every page.
      </p>
    </div>
  );
}
