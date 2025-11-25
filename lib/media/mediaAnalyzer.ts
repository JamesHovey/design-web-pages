/**
 * Analyze widget structures to determine media requirements
 * This enables intelligent, on-demand media fetching
 */

export interface MediaRequirements {
  images: number;
  videos: number;
  hasImageWidgets: boolean;
  hasVideoWidgets: boolean;
  widgetTypes: string[];
}

/**
 * Analyze a widget structure to determine how many images/videos are needed
 * Scans through all widgets and counts media requirements
 */
export function analyzeMediaRequirements(widgetStructure: any): MediaRequirements {
  const requirements: MediaRequirements = {
    images: 0,
    videos: 0,
    hasImageWidgets: false,
    hasVideoWidgets: false,
    widgetTypes: [],
  };

  // Helper function to recursively scan widgets
  function scanWidgets(widgets: any[]): void {
    if (!Array.isArray(widgets)) return;

    for (const widget of widgets) {
      const widgetType = widget.type?.toLowerCase() || "";

      // Track widget type
      if (widgetType && !requirements.widgetTypes.includes(widgetType)) {
        requirements.widgetTypes.push(widgetType);
      }

      // Count media requirements based on widget type
      switch (widgetType) {
        // Image widgets
        case "image":
        case "image-box":
          requirements.images += 1;
          requirements.hasImageWidgets = true;
          break;

        case "image-carousel":
        case "image-gallery":
          // Carousels and galleries typically show 3-6 images
          const imageCount = widget.imageCount || widget.images?.length || 4;
          requirements.images += imageCount;
          requirements.hasImageWidgets = true;
          break;

        case "icon-box":
          // Icon boxes may have background images
          if (widget.backgroundImage || widget.imageUrl) {
            requirements.images += 1;
            requirements.hasImageWidgets = true;
          }
          break;

        case "hero-banner":
        case "call-to-action":
          // Hero banners often have background images
          if (widget.backgroundType === "image" || widget.backgroundImage) {
            requirements.images += 1;
            requirements.hasImageWidgets = true;
          }
          break;

        case "testimonial":
          // Testimonials may include customer photos
          if (widget.showPhoto || widget.imageUrl) {
            requirements.images += 1;
            requirements.hasImageWidgets = true;
          }
          break;

        case "team-member":
          // Team member widgets need headshots
          requirements.images += 1;
          requirements.hasImageWidgets = true;
          break;

        // Video widgets
        case "video":
        case "video-player":
          requirements.videos += 1;
          requirements.hasVideoWidgets = true;
          break;

        case "video-carousel":
        case "video-gallery":
          const videoCount = widget.videoCount || widget.videos?.length || 3;
          requirements.videos += videoCount;
          requirements.hasVideoWidgets = true;
          break;

        default:
          break;
      }

      // Recursively scan nested widgets (for containers, sections, etc.)
      if (widget.widgets) {
        scanWidgets(widget.widgets);
      }
      if (widget.columns) {
        widget.columns.forEach((col: any) => {
          if (col.widgets) scanWidgets(col.widgets);
        });
      }
    }
  }

  // Scan global header
  if (widgetStructure.globalHeader?.widgets) {
    scanWidgets(widgetStructure.globalHeader.widgets);
  }

  // Scan global footer
  if (widgetStructure.globalFooter?.widgets) {
    scanWidgets(widgetStructure.globalFooter.widgets);
  }

  // Scan sections
  if (Array.isArray(widgetStructure.sections)) {
    for (const section of widgetStructure.sections) {
      if (section.widgets) {
        scanWidgets(section.widgets);
      }
    }
  }

  // Scan top-level widgets array (if exists)
  if (Array.isArray(widgetStructure.widgets)) {
    scanWidgets(widgetStructure.widgets);
  }

  return requirements;
}

/**
 * Analyze ALL design variations to get total media requirements
 * Returns the maximum needed across all variations
 */
export function analyzeAllVariations(variations: any[]): MediaRequirements {
  const maxRequirements: MediaRequirements = {
    images: 0,
    videos: 0,
    hasImageWidgets: false,
    hasVideoWidgets: false,
    widgetTypes: [],
  };

  for (const variation of variations) {
    const varRequirements = analyzeMediaRequirements(variation.widgetStructure);

    // Take maximum of each requirement
    maxRequirements.images = Math.max(maxRequirements.images, varRequirements.images);
    maxRequirements.videos = Math.max(maxRequirements.videos, varRequirements.videos);
    maxRequirements.hasImageWidgets = maxRequirements.hasImageWidgets || varRequirements.hasImageWidgets;
    maxRequirements.hasVideoWidgets = maxRequirements.hasVideoWidgets || varRequirements.hasVideoWidgets;

    // Merge widget types
    for (const widgetType of varRequirements.widgetTypes) {
      if (!maxRequirements.widgetTypes.includes(widgetType)) {
        maxRequirements.widgetTypes.push(widgetType);
      }
    }
  }

  return maxRequirements;
}
