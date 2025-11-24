import { NextRequest, NextResponse } from "next/server";

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
  };
}

/**
 * Search Unsplash for stock photos
 * Free API with 50 requests/hour
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "20";

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      return NextResponse.json(
        { error: "Unsplash API not configured. Add UNSPLASH_ACCESS_KEY to environment variables." },
        { status: 503 }
      );
    }

    // Search Unsplash API
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Unsplash API error:", error);
      return NextResponse.json(
        { error: "Failed to search images" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Format response
    const images = data.results.map((img: UnsplashImage) => ({
      id: img.id,
      url: img.urls.regular,
      thumbnail: img.urls.thumb,
      alt: img.alt_description || "Stock photo",
      photographer: img.user.name,
      photographerUrl: img.links.html,
      source: "unsplash",
    }));

    return NextResponse.json({
      images,
      total: data.total,
      totalPages: data.total_pages,
    });
  } catch (error) {
    console.error("Error searching images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
