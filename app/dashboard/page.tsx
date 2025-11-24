"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

interface Design {
  id: string;
  name: string;
  createdAt: string;
  accessibilityScore: number;
  distinctivenessScore: number;
}

interface Project {
  id: string;
  url: string;
  siteType: string;
  industry: string | null;
  status: string;
  createdAt: string;
  designs: Design[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Fetch projects when component mounts
  useEffect(() => {
    if (status === "authenticated") {
      fetchProjects();
    }
  }, [status]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoadingProjects(false);
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

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Turd Polisher
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                AI-Powered Website Design Generator
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Welcome, {session?.user?.name || session?.user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard
          </h2>
          <p className="text-gray-600">
            Choose an option below to get started with your design project
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
          {/* Option 1: New Website */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:border-blue-500 transition-colors">
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  New Website
                </h3>
                <p className="text-gray-600 text-base">
                  Create a brand new website design from scratch using AI-powered design generation
                </p>
              </div>

              <div className="mt-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 font-medium">
                    Coming Soon
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    This feature is currently under development
                  </p>
                </div>
                <Button
                  className="w-full"
                  disabled
                >
                  Create New Website
                </Button>
              </div>
            </div>
          </div>

          {/* Option 2: Existing Website Redesign */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-500">
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Existing Website Redesign
                </h3>
                <p className="text-gray-600 text-base">
                  Redesign an existing website with AI-powered competitor analysis and design generation
                </p>
              </div>

              <div className="mt-auto">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ Available Now
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Primary feature with full functionality
                  </p>
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => router.push("/projects/new")}
                >
                  Redesign Existing Website
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Recent Projects
          </h3>

          {loadingProjects ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">
                No projects yet. Start by creating a new design project above.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="p-6">
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 truncate">
                          {project.url}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="capitalize">{project.siteType}</span>
                          {project.industry && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{project.industry}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          project.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : project.status === "generating"
                            ? "bg-blue-100 text-blue-800"
                            : project.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    {/* Designs Count */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        {project.designs.length} {project.designs.length === 1 ? "design" : "designs"} generated
                      </p>
                    </div>

                    {/* Designs List */}
                    {project.designs.length > 0 && (
                      <div className="border-t border-gray-100 pt-4 space-y-2">
                        {project.designs.slice(0, 3).map((design) => (
                          <div
                            key={design.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-700 truncate flex-1">
                              {design.name}
                            </span>
                            <div className="flex items-center gap-2 ml-2">
                              <span className="text-xs text-gray-500">
                                {design.accessibilityScore}%
                              </span>
                            </div>
                          </div>
                        ))}
                        {project.designs.length > 3 && (
                          <p className="text-xs text-gray-500 pt-2">
                            +{project.designs.length - 3} more
                          </p>
                        )}
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* View Project Button */}
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      View Project →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
