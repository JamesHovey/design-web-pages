"use client";

export default function VersionIndicator() {
  const version = "1.3.2";
  const phase = "Deployed";
  const buildDate = "2025-11-24";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-mono">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">v{version}</span>
            <span className="text-gray-600">|</span>
            <span className="text-green-400">{phase}</span>
          </div>
          <div className="text-gray-500 text-[10px]">{buildDate}</div>
        </div>
      </div>
    </div>
  );
}
