/**
 * Export design to Elementor JSON format
 * Generates a JSON file compatible with Elementor page builder v0.4+
 * Based on official Elementor data structure documentation
 */

import type { ElementorDocument, ElementorWidget, ElementorContainer } from "@/lib/elementor/types";

interface ElementorElement {
  id: string;
  elType: string;
  settings: Record<string, any>;
  elements?: ElementorElement[];
  widgetType?: string;
  isInner?: boolean;
}

interface DesignData {
  widgetStructure: any;
  name: string;
  description: string;
}

/**
 * Generate Elementor-compatible JSON from design widget structure
 * Uses Elementor v0.4 schema with container-based layout
 */
export function generateElementorJSON(design: DesignData): ElementorDocument {
  const sections = design.widgetStructure?.sections || [];

  const elementorContent: ElementorElement[] = [];

  // Convert each section to Elementor container format
  sections.forEach((section: any) => {
    const containerElement: ElementorElement = {
      id: generateId(),
      elType: "container",
      isInner: false,
      settings: {
        content_width: section.layout || "boxed",
        flex_direction: "column",
        padding: {
          top: section.spacing?.top || 60,
          right: 40,
          bottom: section.spacing?.bottom || 60,
          left: 40,
          unit: "px",
        },
        background_background: section.background ? "classic" : undefined,
        background_color: section.background || undefined,
      },
      elements: [],
    };

    // Convert widgets directly into container (no columns needed with new structure)
    const widgets = section.widgets || [];
    widgets.forEach((widget: any) => {
      const elementorWidget = convertWidgetToElementor(widget);
      if (elementorWidget) {
        containerElement.elements!.push(elementorWidget);
      }
    });

    elementorContent.push(containerElement);
  });

  // Add global header if exists
  if (design.widgetStructure?.globalHeader) {
    const headerContainer: ElementorElement = {
      id: generateId(),
      elType: "container",
      isInner: false,
      settings: {
        content_width: "full",
      },
      elements: [convertWidgetToElementor(design.widgetStructure.globalHeader)].filter((el): el is ElementorElement => el !== null),
    };
    elementorContent.unshift(headerContainer);
  }

  // Add global footer if exists
  if (design.widgetStructure?.globalFooter) {
    const footerContainer: ElementorElement = {
      id: generateId(),
      elType: "container",
      isInner: false,
      settings: {
        content_width: "full",
      },
      elements: [convertWidgetToElementor(design.widgetStructure.globalFooter)].filter((el): el is ElementorElement => el !== null),
    };
    elementorContent.push(footerContainer);
  }

  // Return proper Elementor v0.4 document structure
  return {
    title: design.name,
    type: "page",
    version: "0.4",
    page_settings: {
      template: "elementor_canvas",
    },
    content: elementorContent,
  };
}

/**
 * Convert generic widget to Elementor widget format
 */
function convertWidgetToElementor(widget: any): ElementorElement | null {
  if (!widget || !widget.type) return null;

  const baseSettings = {
    _element_id: widget.id || "",
  };

  switch (widget.type) {
    case "heading":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "heading",
        isInner: false,
        settings: {
          ...baseSettings,
          title: widget.text || "",
          header_size: widget.level || "h2",
          align: widget.position || "left",
        },
      };

    case "text-editor":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "text-editor",
        isInner: false,
        settings: {
          ...baseSettings,
          editor: widget.text || "",
        },
      };

    case "button":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "button",
        isInner: false,
        settings: {
          ...baseSettings,
          text: widget.text || "Click Here",
          link: {
            url: widget.link || "#",
            is_external: false,
            nofollow: false,
          },
          size: widget.size || "sm",
          align: widget.position || "left",
        },
      };

    case "image":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "image",
        isInner: false,
        settings: {
          ...baseSettings,
          image: {
            url: widget.url || "",
          },
          image_size: "large",
          align: widget.position || "center",
        },
      };

    case "video":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "video",
        isInner: false,
        settings: {
          ...baseSettings,
          video_type: widget.url?.includes("youtube") ? "youtube" : "hosted",
          youtube_url: widget.url || "",
          hosted_url: widget.url || "",
          aspect_ratio: "169",
        },
      };

    case "divider":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "divider",
        isInner: false,
        settings: {
          ...baseSettings,
          style: widget.style || "solid",
          weight: {
            size: widget.width || 1,
            unit: "px",
          },
        },
      };

    case "spacer":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "spacer",
        isInner: false,
        settings: {
          ...baseSettings,
          space: {
            size: widget.height || 50,
            unit: "px",
          },
        },
      };

    case "google_maps":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "google_maps",
        isInner: false,
        settings: {
          ...baseSettings,
          address: widget.address || "New York, NY",
          zoom: {
            size: widget.zoom || 12,
          },
        },
      };

    case "icon":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "icon",
        isInner: false,
        settings: {
          ...baseSettings,
          selected_icon: {
            value: widget.icon || "fas fa-star",
            library: "fa-solid",
          },
          view: widget.view || "default",
        },
      };

    case "icon-box":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "icon-box",
        isInner: false,
        settings: {
          ...baseSettings,
          selected_icon: {
            value: widget.icon || "fas fa-star",
            library: "fa-solid",
          },
          title_text: widget.title || "Feature Title",
          description_text: widget.description || "Feature description.",
        },
      };

    case "image-box":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "image-box",
        isInner: false,
        settings: {
          ...baseSettings,
          image: {
            url: widget.url || "",
          },
          title_text: widget.title || "Image Box Title",
          description_text: widget.description || "Description text.",
        },
      };

    case "testimonial":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "testimonial",
        isInner: false,
        settings: {
          ...baseSettings,
          testimonial_content: widget.text || "Great testimonial.",
          testimonial_name: widget.name || "John Doe",
          testimonial_job: widget.position || "Customer",
        },
      };

    case "star-rating":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "star-rating",
        isInner: false,
        settings: {
          ...baseSettings,
          rating: {
            size: widget.rating || 5,
          },
        },
      };

    case "social-icons":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "social-icons",
        isInner: false,
        settings: {
          ...baseSettings,
          social_icon_list: widget.icons || [],
        },
      };

    case "counter":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "counter",
        isInner: false,
        settings: {
          ...baseSettings,
          ending_number: widget.endNumber || 100,
          title: widget.title || "Counter",
        },
      };

    case "progress":
    case "progress-bar":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "progress",
        isInner: false,
        settings: {
          ...baseSettings,
          title: widget.title || "Skill",
          percent: {
            size: widget.percent || 80,
          },
        },
      };

    case "accordion":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "accordion",
        isInner: false,
        settings: {
          ...baseSettings,
          tabs: widget.items || [],
        },
      };

    case "tabs":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "tabs",
        isInner: false,
        settings: {
          ...baseSettings,
          tabs: widget.tabs || [],
        },
      };

    case "alert":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "alert",
        isInner: false,
        settings: {
          ...baseSettings,
          alert_type: widget.type || "info",
          alert_description: widget.text || "Alert message.",
        },
      };

    case "call-to-action":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "call-to-action",
        isInner: false,
        settings: {
          ...baseSettings,
          title: widget.title || "Ready to Get Started?",
          description: widget.description || "Join us today.",
          button: {
            text: widget.buttonText || "Get Started",
            url: widget.buttonLink || "#",
          },
        },
      };

    case "image-gallery":
    case "gallery":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "image-gallery",
        isInner: false,
        settings: {
          ...baseSettings,
          gallery: widget.images || [],
        },
      };

    case "image-carousel":
    case "carousel":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "image-carousel",
        isInner: false,
        settings: {
          ...baseSettings,
          slides: widget.slides || [],
        },
      };

    case "icon-list":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "icon-list",
        isInner: false,
        settings: {
          ...baseSettings,
          icon_list: widget.items || [],
        },
      };

    case "toggle":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "toggle",
        isInner: false,
        settings: {
          ...baseSettings,
          tabs: widget.items || [],
        },
      };

    case "html":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "html",
        isInner: false,
        settings: {
          ...baseSettings,
          html: widget.html || "",
        },
      };

    case "audio":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "audio",
        isInner: false,
        settings: {
          ...baseSettings,
          audio_url: widget.url || "",
        },
      };

    case "form":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "form",
        isInner: false,
        settings: {
          ...baseSettings,
          form_fields: widget.fields || [],
          button_text: widget.buttonText || "Submit",
        },
      };

    case "price-table":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "price-table",
        isInner: false,
        settings: {
          ...baseSettings,
          heading: widget.title || "Basic Plan",
          price: widget.price || "29",
          currency_symbol: widget.currency || "$",
          period: widget.period || "mo",
          features_list: widget.features || [],
          button_text: widget.buttonText || "Get Started",
          featured: widget.featured ? "yes" : "no",
        },
      };

    case "flip-box":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "flip-box",
        isInner: false,
        settings: {
          ...baseSettings,
          front_title: widget.frontTitle || "Front Title",
          front_description: widget.frontDescription || "",
          back_title: widget.backTitle || "Back Title",
          back_description: widget.backDescription || "",
          button_text: widget.buttonText || "",
        },
      };

    case "countdown":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "countdown",
        isInner: false,
        settings: {
          ...baseSettings,
          due_date: widget.dueDate || "",
        },
      };

    case "animated-headline":
      return {
        id: generateId(),
        elType: "widget",
        widgetType: "animated-headline",
        isInner: false,
        settings: {
          ...baseSettings,
          before_text: widget.beforeText || "",
          rotating_text: widget.animatedText || [],
          after_text: widget.afterText || "",
        },
      };

    case "global-header":
    case "global-footer":
      // These are handled specially in the main function
      return null;

    default:
      // Generic widget fallback - still include isInner
      return {
        id: generateId(),
        elType: "widget",
        widgetType: widget.type,
        isInner: false,
        settings: baseSettings,
      };
  }
}

/**
 * Generate unique Elementor-style ID
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 7);
}

/**
 * Export as downloadable JSON file
 */
export function createElementorDownload(design: DesignData): Blob {
  const json = generateElementorJSON(design);
  const jsonString = JSON.stringify(json, null, 2);
  return new Blob([jsonString], { type: "application/json" });
}
