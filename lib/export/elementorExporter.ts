/**
 * Export design to Elementor JSON format
 * Generates a JSON file compatible with Elementor page builder
 */

interface ElementorElement {
  id: string;
  elType: string;
  settings: Record<string, any>;
  elements?: ElementorElement[];
}

interface DesignData {
  widgetStructure: any;
  name: string;
  description: string;
}

/**
 * Generate Elementor-compatible JSON from design widget structure
 */
export function generateElementorJSON(design: DesignData): any {
  const sections = design.widgetStructure?.sections || [];

  const elementorData: ElementorElement[] = [];

  // Convert each section to Elementor format
  sections.forEach((section: any, index: number) => {
    const sectionElement: ElementorElement = {
      id: generateId(),
      elType: "section",
      settings: {
        layout: section.layout || "boxed",
        padding: {
          top: section.spacing?.top || 80,
          right: 0,
          bottom: section.spacing?.bottom || 80,
          left: 0,
          unit: "px",
        },
        gap: "default",
        structure: "10", // Single column by default
      },
      elements: [],
    };

    // Create column
    const columnElement: ElementorElement = {
      id: generateId(),
      elType: "column",
      settings: {
        _column_size: 100,
        _inline_size: null,
      },
      elements: [],
    };

    // Convert widgets
    const widgets = section.widgets || [];
    widgets.forEach((widget: any) => {
      const elementorWidget = convertWidgetToElementor(widget);
      if (elementorWidget) {
        columnElement.elements!.push(elementorWidget);
      }
    });

    sectionElement.elements!.push(columnElement);
    elementorData.push(sectionElement);
  });

  // Add global header if exists
  if (design.widgetStructure?.globalHeader) {
    const headerSection = {
      id: generateId(),
      elType: "section",
      settings: {
        layout: "boxed",
        structure: "10",
      },
      elements: [
        {
          id: generateId(),
          elType: "column",
          settings: {},
          elements: [convertWidgetToElementor(design.widgetStructure.globalHeader)].filter((el): el is ElementorElement => el !== null),
        },
      ],
    };
    elementorData.unshift(headerSection);
  }

  // Add global footer if exists
  if (design.widgetStructure?.globalFooter) {
    const footerSection = {
      id: generateId(),
      elType: "section",
      settings: {
        layout: "boxed",
        structure: "10",
      },
      elements: [
        {
          id: generateId(),
          elType: "column",
          settings: {},
          elements: [convertWidgetToElementor(design.widgetStructure.globalFooter)].filter((el): el is ElementorElement => el !== null),
        },
      ],
    };
    elementorData.push(footerSection);
  }

  return {
    content: elementorData,
    page_settings: {
      template: "elementor_canvas",
    },
    version: "3.16.0",
    title: design.name,
    type: "page",
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
        settings: {
          ...baseSettings,
          title: widget.text || "",
          header_size: widget.level || "h2",
          typography_typography: "custom",
          typography_font_size: {
            size: widget.fontSize || 32,
            unit: "px",
          },
          typography_font_family: widget.fontFamily || "",
          align: widget.position || "left",
        },
        widgetType: "heading",
      };

    case "text-editor":
      return {
        id: generateId(),
        elType: "widget",
        settings: {
          ...baseSettings,
          editor: widget.text || "",
          typography_typography: "custom",
          typography_font_size: {
            size: widget.fontSize || 16,
            unit: "px",
          },
        },
        widgetType: "text-editor",
      };

    case "button":
      return {
        id: generateId(),
        elType: "widget",
        settings: {
          ...baseSettings,
          text: widget.text || "Click Here",
          link: {
            url: widget.link || "#",
            is_external: "",
            nofollow: "",
          },
          size: widget.size || "md",
          button_type: widget.style || "primary",
          align: widget.position || "left",
        },
        widgetType: "button",
      };

    case "image":
      return {
        id: generateId(),
        elType: "widget",
        settings: {
          ...baseSettings,
          image: {
            url: widget.url || "",
            id: "",
          },
          image_size: "large",
          align: widget.position || "center",
          caption_source: "none",
        },
        widgetType: "image",
      };

    case "video":
      return {
        id: generateId(),
        elType: "widget",
        settings: {
          ...baseSettings,
          video_type: "youtube",
          youtube_url: widget.url || "",
          aspect_ratio: "169",
        },
        widgetType: "video",
      };

    case "divider":
      return {
        id: generateId(),
        elType: "widget",
        settings: {
          ...baseSettings,
          style: "solid",
          weight: {
            size: 1,
            unit: "px",
          },
          gap: {
            size: 15,
            unit: "px",
          },
        },
        widgetType: "divider",
      };

    case "spacer":
      return {
        id: generateId(),
        elType: "widget",
        settings: {
          ...baseSettings,
          space: {
            size: widget.height || 50,
            unit: "px",
          },
        },
        widgetType: "spacer",
      };

    default:
      // Generic widget fallback
      return {
        id: generateId(),
        elType: "widget",
        settings: baseSettings,
        widgetType: widget.type,
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
