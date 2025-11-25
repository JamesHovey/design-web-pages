"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface MediaItem {
  type: "image" | "video";
  url: string;
  source: "url" | "unsplash" | "pexels";
  name?: string;
  photographer?: string;
  duration?: number;
}

interface MediaUploadProps {
  value?: MediaItem[];
  onChange?: (media: MediaItem[]) => void;
  industry?: string;
}

interface UnsplashImage {
  id: string;
  url: string;
  thumbnail: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

interface PexelsVideo {
  id: number;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  duration: number;
  creator: string;
  creatorUrl: string;
}

export default function MediaUpload({ value = [], onChange, industry }: MediaUploadProps) {
  const [media, setMedia] = useState<MediaItem[]>(value);
  const [activeTab, setActiveTab] = useState<"url" | "stock">("stock");
  const [stockMediaType, setStockMediaType] = useState<"photos" | "videos">("photos");

  // URL tab state
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  // Stock photos state
  const [searchQuery, setSearchQuery] = useState(industry || "");
  const [stockImages, setStockImages] = useState<UnsplashImage[]>([]);
  const [stockVideos, setStockVideos] = useState<PexelsVideo[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [error, setError] = useState("");

  const handleAddUrl = () => {
    setError("");

    if (!mediaUrl.trim()) {
      setError("Please enter a media URL");
      return;
    }

    try {
      new URL(mediaUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    const newMedia: MediaItem = {
      type: mediaType,
      url: mediaUrl,
      source: "url",
      name: mediaUrl.split("/").pop() || "Media",
    };

    const updated = [...media, newMedia];
    setMedia(updated);
    onChange?.(updated);
    setMediaUrl("");
  };

  const handleSearchStock = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter a search term");
      return;
    }

    if (stockMediaType === "photos") {
      await handleSearchPhotos();
    } else {
      await handleSearchVideos();
    }
  };

  const handleSearchPhotos = async () => {
    setSearching(true);
    setSearchError("");

    try {
      const response = await fetch(
        `/api/images/search?query=${encodeURIComponent(searchQuery)}&per_page=20`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to search images");
      }

      const data = await response.json();
      setStockImages(data.images);
      setStockVideos([]); // Clear videos
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Failed to search images");
    } finally {
      setSearching(false);
    }
  };

  const handleSearchVideos = async () => {
    setSearching(true);
    setSearchError("");

    try {
      const response = await fetch(
        `/api/videos/search?query=${encodeURIComponent(searchQuery)}&per_page=15`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to search videos");
      }

      const data = await response.json();
      setStockVideos(data.videos);
      setStockImages([]); // Clear images
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Failed to search videos");
    } finally {
      setSearching(false);
    }
  };

  const handleAddStockImage = (image: UnsplashImage) => {
    const newMedia: MediaItem = {
      type: "image",
      url: image.url,
      source: "unsplash",
      name: image.alt,
      photographer: image.photographer,
    };

    const updated = [...media, newMedia];
    setMedia(updated);
    onChange?.(updated);
  };

  const handleAddStockVideo = (video: PexelsVideo) => {
    const newMedia: MediaItem = {
      type: "video",
      url: video.url,
      source: "pexels",
      name: `${video.creator} video`,
      photographer: video.creator,
      duration: video.duration,
    };

    const updated = [...media, newMedia];
    setMedia(updated);
    onChange?.(updated);
  };

  const handleRemove = (index: number) => {
    const updated = media.filter((_, i) => i !== index);
    setMedia(updated);
    onChange?.(updated);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("stock")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "stock"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            📸 Stock Media (Free)
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "url"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            🔗 Add by URL
          </button>
        </div>
      </div>

      {/* Stock Media Tab */}
      {activeTab === "stock" && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Search Free Stock Media
              </h3>
              <p className="text-sm text-gray-600">
                {stockMediaType === "photos"
                  ? "High-quality images from Unsplash"
                  : "HD & 4K videos from Pexels"} - Free for commercial use
              </p>
            </div>

            {/* Photos/Videos Toggle */}
            <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setStockMediaType("photos")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  stockMediaType === "photos"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                📸 Photos
              </button>
              <button
                onClick={() => setStockMediaType("videos")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  stockMediaType === "videos"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                🎬 Videos
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search for "${industry || 'business'}" ${stockMediaType}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleSearchStock()}
            />
            <Button onClick={handleSearchStock} disabled={searching}>
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>

          {searchError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {searchError}
            </div>
          )}

          {/* Stock Photos Grid */}
          {stockMediaType === "photos" && stockImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stockImages.map((image) => (
                <div
                  key={image.id}
                  className="relative group border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handleAddStockImage(image)}
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={image.thumbnail}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white rounded-full p-3">
                        <svg
                          className="w-6 h-6 text-blue-600"
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
                    </div>
                  </div>
                  <div className="p-2 bg-white">
                    <p className="text-xs text-gray-500 truncate">
                      by {image.photographer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stock Videos Grid */}
          {stockMediaType === "videos" && stockVideos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stockVideos.map((video) => (
                <div
                  key={video.id}
                  className="relative group border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handleAddStockVideo(video)}
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={video.thumbnail}
                      alt={`Video by ${video.creator}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Play icon overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-3">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>

                  <div className="p-2 bg-white">
                    <p className="text-xs text-gray-500 truncate">
                      by {video.creator}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {((stockMediaType === "photos" && stockImages.length === 0) ||
            (stockMediaType === "videos" && stockVideos.length === 0)) &&
            !searching && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {stockMediaType === "photos" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                )}
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Search for high-quality stock {stockMediaType}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Try searching for your industry: "{industry || 'business'}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL Tab */}
      {activeTab === "url" && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Media by URL</h3>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media URL
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as "image" | "video")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>

            <Button onClick={handleAddUrl}>Add Media</Button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Library */}
      {media.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Media Library ({media.length})
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item, index) => (
              <div
                key={index}
                className="relative group border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
              >
                {item.type === "image" ? (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EImage%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-900 flex items-center justify-center relative">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    {item.duration && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(item.duration)}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-600 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                      {item.photographer && (
                        <span className="text-xs text-gray-400">by {item.photographer}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(index)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>How Media Works:</strong> Media assets are automatically populated from free stock APIs (Unsplash for photos, Pexels for videos) based on your industry.
          Search above to find additional assets or replace auto-selected media. All media is free for commercial use.
        </p>
      </div>
    </div>
  );
}
