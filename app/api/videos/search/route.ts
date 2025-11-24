import { NextRequest, NextResponse } from "next/server";

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  image: string;
  video_files: Array<{
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }>;
  video_pictures: Array<{
    id: number;
    picture: string;
  }>;
  user: {
    name: string;
    url: string;
  };
}

/**
 * Search Pexels for stock videos
 * Free API with no rate limits
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "15";

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Pexels API not configured. Add PEXELS_API_KEY to environment variables." },
        { status: 503 }
      );
    }

    // Search Pexels Videos API
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Pexels API error:", error);
      return NextResponse.json(
        { error: "Failed to search videos" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Format response
    const videos = data.videos.map((video: PexelsVideo) => {
      // Get HD video file (prefer 1920x1080)
      const hdFile = video.video_files.find(f =>
        f.quality === "hd" || f.width === 1920
      ) || video.video_files[0];

      return {
        id: video.id,
        url: hdFile.link,
        thumbnail: video.image,
        width: video.width,
        height: video.height,
        duration: video.duration,
        creator: video.user.name,
        creatorUrl: video.user.url,
        source: "pexels",
      };
    });

    return NextResponse.json({
      videos,
      total: data.total_results,
      page: data.page,
      perPage: data.per_page,
    });
  } catch (error) {
    console.error("Error searching videos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
