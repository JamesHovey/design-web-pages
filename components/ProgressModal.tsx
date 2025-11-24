"use client";

interface ProgressModalProps {
  isOpen: boolean;
  stage: "saving" | "analyzing" | "generating" | "screenshots" | "complete" | "error";
  error?: string;
}

export default function ProgressModal({ isOpen, stage, error }: ProgressModalProps) {
  if (!isOpen) return null;

  const stages = [
    { key: "saving", label: "Saving Configuration", icon: "💾" },
    { key: "analyzing", label: "Analyzing Requirements", icon: "🔍" },
    { key: "generating", label: "Generating 3 AI Design Variations", icon: "🎨" },
    { key: "screenshots", label: "Creating Screenshot Previews", icon: "📸" },
    { key: "complete", label: "Designs Ready!", icon: "✅" },
  ];

  const getCurrentStageIndex = () => {
    return stages.findIndex(s => s.key === stage);
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {error ? (
          // Error State
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">❌</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Generation Failed
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </>
        ) : stage === "complete" ? (
          // Complete State
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-3xl">✅</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Designs Generated Successfully!
            </h2>
            <p className="text-center text-gray-600 mb-6">
              3 unique design variations are ready to view
            </p>
            <div className="animate-pulse text-center text-sm text-gray-500">
              Redirecting to design gallery...
            </div>
          </>
        ) : (
          // Progress State
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Generating Designs
            </h2>
            <p className="text-center text-gray-600 mb-8">
              This may take 30-60 seconds...
            </p>

            {/* Progress Steps */}
            <div className="space-y-4">
              {stages.slice(0, -1).map((s, index) => {
                const isActive = index === currentIndex;
                const isComplete = index < currentIndex;
                const isPending = index > currentIndex;

                return (
                  <div
                    key={s.key}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      isActive
                        ? "bg-blue-50 border-2 border-blue-600"
                        : isComplete
                        ? "bg-green-50 border-2 border-green-600"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : isComplete
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {isComplete ? (
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="text-xl">{s.icon}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          isActive
                            ? "text-blue-900"
                            : isComplete
                            ? "text-green-900"
                            : "text-gray-600"
                        }`}
                      >
                        {s.label}
                      </p>
                      {isActive && (
                        <p className="text-sm text-blue-600 mt-1">In progress...</p>
                      )}
                      {isComplete && (
                        <p className="text-sm text-green-600 mt-1">Complete</p>
                      )}
                    </div>
                    {isActive && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> Don't close this window while designs are being generated.
                Screenshots will continue generating in the background after you're redirected.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
