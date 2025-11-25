/**
 * Auto-populate media assets based on industry
 * Fetches relevant stock images and videos from Unsplash and Pexels
 */

interface MediaItem {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  source: "unsplash" | "pexels";
  photographer?: string;
  photographerUrl?: string;
  alt?: string;
  duration?: number;
  width?: number;
  height?: number;
}

interface AutoPopulateResult {
  media: MediaItem[];
  searchQuery: string;
  success: boolean;
  error?: string;
}

/**
 * Generate search queries based on industry
 * Returns primary query + fallback queries for better results
 */
function generateSearchQueries(industry: string): string[] {
  const industryLower = industry.toLowerCase();

  // Industry-specific search terms
  const searchMap: Record<string, string[]> = {
    // Food & Beverage
    "bakery": ["fresh bread bakery", "artisan bakery", "bakery interior"],
    "restaurant": ["restaurant food", "dining experience", "chef cooking"],
    "cafe": ["coffee shop", "cafe interior", "barista"],
    "catering": ["catering food", "event catering", "buffet"],

    // Professional Services
    "legal": ["law office", "legal professionals", "justice"],
    "accounting": ["accountant office", "financial planning", "business finance"],
    "consulting": ["business consulting", "professional meeting", "strategy"],
    "marketing": ["digital marketing", "creative team", "brand strategy"],

    // Healthcare
    "healthcare": ["medical professionals", "hospital care", "health"],
    "dental": ["dental clinic", "dentist office", "dental care"],
    "wellness": ["wellness spa", "meditation", "healthy lifestyle"],
    "fitness": ["gym workout", "fitness training", "exercise"],

    // Tech & Digital
    "technology": ["tech startup", "software development", "innovation"],
    "saas": ["cloud computing", "digital workspace", "tech team"],
    "ai": ["artificial intelligence", "machine learning", "future tech"],
    "web design": ["web design", "ui ux design", "creative workspace"],

    // Retail & E-commerce
    "retail": ["retail store", "shopping experience", "product display"],
    "fashion": ["fashion boutique", "clothing store", "style"],
    "jewelry": ["jewelry store", "luxury jewelry", "gems"],
    "home decor": ["home interior", "modern furniture", "decor"],

    // Real Estate & Construction
    "real estate": ["modern house", "property architecture", "real estate"],
    "construction": ["construction site", "building contractor", "architecture"],
    "interior design": ["interior design", "home staging", "modern interior"],

    // Travel & Hospitality
    "hotel": ["luxury hotel", "hotel lobby", "hospitality"],
    "travel": ["travel destination", "adventure travel", "vacation"],
    "tourism": ["tourist attraction", "travel experience", "destination"],

    // Education
    "education": ["classroom learning", "students studying", "education"],
    "tutoring": ["private tutoring", "student success", "learning"],

    // Automotive
    "automotive": ["car dealership", "luxury car", "automotive"],
    "car repair": ["auto repair shop", "mechanic working", "car service"],

    // Beauty & Personal Care
    "salon": ["hair salon", "beauty salon", "hairstyling"],
    "spa": ["spa treatment", "massage spa", "relaxation"],
    "beauty": ["beauty products", "cosmetics", "skincare"],

    // Sports & Recreation
    "sports": ["sports training", "athletic performance", "fitness"],
    "outdoor": ["outdoor adventure", "hiking nature", "camping"],
    "golf": ["golf course", "golf club", "golfing"],

    // Entertainment
    "photography": ["professional photography", "camera equipment", "photo studio"],
    "videography": ["video production", "film making", "cinematography"],
    "music": ["music studio", "live performance", "musician"],

    // Home Services
    "plumbing": ["plumber working", "home repair", "plumbing service"],
    "electrical": ["electrician working", "electrical service", "home wiring"],
    "cleaning": ["house cleaning", "professional cleaning", "clean home"],

    // Financial Services
    "insurance": ["insurance agent", "family protection", "financial security"],
    "investment": ["investment planning", "financial growth", "stock market"],
    "banking": ["bank branch", "financial services", "banking"],

    // Pet Services
    "veterinary": ["veterinary clinic", "pet care", "animal doctor"],
    "pet grooming": ["dog grooming", "pet salon", "pet care"],
  };

  // Find matching queries
  for (const [key, queries] of Object.entries(searchMap)) {
    if (industryLower.includes(key)) {
      return queries;
    }
  }

  // Fallback: use industry name directly with generic terms
  return [
    industry,
    `${industry} business`,
    `${industry} professional`,
  ];
}

/**
 * Fetch stock images from Unsplash
 */
async function fetchUnsplashImages(query: string, count: number = 5): Promise<MediaItem[]> {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      console.warn("[AutoPopulate] Unsplash API key not configured");
      return [];
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=1&per_page=${count}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error("[AutoPopulate] Unsplash API error:", response.status);
      return [];
    }

    const data = await response.json();

    return data.results.map((img: any) => ({
      type: "image" as const,
      url: img.urls.regular,
      thumbnail: img.urls.thumb,
      source: "unsplash" as const,
      photographer: img.user.name,
      photographerUrl: img.links.html,
      alt: img.alt_description || query,
    }));
  } catch (error) {
    console.error("[AutoPopulate] Error fetching Unsplash images:", error);
    return [];
  }
}

/**
 * Fetch stock videos from Pexels
 */
async function fetchPexelsVideos(query: string, count: number = 3): Promise<MediaItem[]> {
  try {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      console.warn("[AutoPopulate] Pexels API key not configured");
      return [];
    }

    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=1&per_page=${count}`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error("[AutoPopulate] Pexels API error:", response.status);
      return [];
    }

    const data = await response.json();

    return data.videos.map((video: any) => {
      // Get HD video file
      const hdFile = video.video_files.find((f: any) =>
        f.quality === "hd" || f.width === 1920
      ) || video.video_files[0];

      return {
        type: "video" as const,
        url: hdFile.link,
        thumbnail: video.image,
        source: "pexels" as const,
        photographer: video.user.name,
        photographerUrl: video.user.url,
        duration: video.duration,
        width: video.width,
        height: video.height,
        alt: query,
      };
    });
  } catch (error) {
    console.error("[AutoPopulate] Error fetching Pexels videos:", error);
    return [];
  }
}

/**
 * Auto-populate media assets based on detected industry
 * Fetches top images and videos from stock libraries
 */
export async function autoPopulateMedia(industry: string): Promise<AutoPopulateResult> {
  if (!industry) {
    return {
      media: [],
      searchQuery: "",
      success: false,
      error: "No industry provided",
    };
  }

  console.log(`[AutoPopulate] Fetching media for industry: ${industry}`);

  const searchQueries = generateSearchQueries(industry);
  const primaryQuery = searchQueries[0];

  try {
    // Fetch images and videos in parallel
    const [images, videos] = await Promise.all([
      fetchUnsplashImages(primaryQuery, 5),
      fetchPexelsVideos(primaryQuery, 3),
    ]);

    // If primary query returned no results, try fallback queries
    let allMedia = [...images, ...videos];

    if (allMedia.length === 0 && searchQueries.length > 1) {
      console.log(`[AutoPopulate] Primary query returned no results, trying fallback: ${searchQueries[1]}`);
      const [fallbackImages, fallbackVideos] = await Promise.all([
        fetchUnsplashImages(searchQueries[1], 5),
        fetchPexelsVideos(searchQueries[1], 3),
      ]);
      allMedia = [...fallbackImages, ...fallbackVideos];
    }

    console.log(`[AutoPopulate] Found ${images.length} images and ${videos.length} videos`);

    return {
      media: allMedia,
      searchQuery: primaryQuery,
      success: allMedia.length > 0,
      error: allMedia.length === 0 ? "No media found for this industry" : undefined,
    };
  } catch (error) {
    console.error("[AutoPopulate] Error auto-populating media:", error);
    return {
      media: [],
      searchQuery: primaryQuery,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
