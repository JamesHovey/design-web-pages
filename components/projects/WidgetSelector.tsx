"use client";

import { useState, useMemo } from "react";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";

interface Widget {
  id: string;
  name: string;
  category: "global" | "basic" | "pro" | "general" | "site" | "single" | "woocommerce";
  description?: string;
  defaultChecked?: boolean;
  pro?: boolean;
  woocommerceOnly?: boolean;
  characterLimits?: Record<string, number>;
}

interface WidgetSelectorProps {
  value?: string[];
  siteType?: "ecommerce" | "lead-generation";
  onChange?: (widgets: string[]) => void;
}

const WIDGETS: Widget[] = [
  // Global Widgets (Always needed)
  {
    id: "global-header",
    name: "Global Header",
    category: "global",
    description: "Site-wide navigation header",
    defaultChecked: true,
  },
  {
    id: "global-footer",
    name: "Global Footer",
    category: "global",
    description: "Site-wide footer with links and info",
    defaultChecked: true,
  },

  // Hero/Landing
  {
    id: "hero-banner",
    name: "Hero Banner",
    category: "basic",
    description: "Primary landing section with CTA",
    defaultChecked: true,
  },

  // Basic Widgets
  {
    id: "heading",
    name: "Heading",
    category: "basic",
    description: "Text headings (H1-H6)",
    characterLimits: {
      h1: 50,
      h2: 60,
      h3: 70,
      h4: 80,
    },
  },
  {
    id: "text-editor",
    name: "Text Editor",
    category: "basic",
    description: "Rich text content blocks",
  },
  {
    id: "image",
    name: "Image",
    category: "basic",
    description: "Single image with optional caption",
  },
  {
    id: "video",
    name: "Video",
    category: "basic",
    description: "Embedded video (YouTube, Vimeo, self-hosted)",
  },
  {
    id: "button",
    name: "Button",
    category: "basic",
    description: "Call-to-action buttons",
  },
  {
    id: "divider",
    name: "Divider",
    category: "basic",
    description: "Visual section separator",
  },
  {
    id: "spacer",
    name: "Spacer",
    category: "basic",
    description: "Vertical spacing control",
  },
  {
    id: "google-maps",
    name: "Google Maps",
    category: "basic",
    description: "Embedded map location",
  },
  {
    id: "icon",
    name: "Icon",
    category: "basic",
    description: "Icon with optional link",
  },

  // General Widgets
  {
    id: "icon-box",
    name: "Icon Box",
    category: "general",
    description: "Icon with heading and description",
  },
  {
    id: "image-box",
    name: "Image Box",
    category: "general",
    description: "Image with heading and description",
  },
  {
    id: "star-rating",
    name: "Star Rating",
    category: "general",
    description: "Visual star rating display",
  },
  {
    id: "testimonial",
    name: "Testimonial",
    category: "general",
    description: "Customer testimonial with avatar",
  },
  {
    id: "tabs",
    name: "Tabs",
    category: "general",
    description: "Tabbed content sections",
  },
  {
    id: "accordion",
    name: "Accordion",
    category: "general",
    description: "Collapsible content panels",
  },
  {
    id: "toggle",
    name: "Toggle",
    category: "general",
    description: "Show/hide content sections",
  },
  {
    id: "social-icons",
    name: "Social Icons",
    category: "general",
    description: "Social media icon links",
  },
  {
    id: "alert",
    name: "Alert",
    category: "general",
    description: "Alert/notification box",
  },
  {
    id: "counter",
    name: "Counter",
    category: "general",
    description: "Animated number counter",
  },
  {
    id: "progress-bar",
    name: "Progress Bar",
    category: "general",
    description: "Visual progress indicator",
  },

  // Pro Widgets
  {
    id: "form",
    name: "Form",
    category: "pro",
    description: "Contact/lead generation forms",
    pro: true,
  },
  {
    id: "posts-grid",
    name: "Posts Grid",
    category: "pro",
    description: "Blog posts in grid layout",
    pro: true,
  },
  {
    id: "portfolio",
    name: "Portfolio",
    category: "pro",
    description: "Portfolio item showcase",
    pro: true,
  },
  {
    id: "gallery",
    name: "Gallery",
    category: "pro",
    description: "Image gallery with lightbox",
    pro: true,
  },
  {
    id: "carousel",
    name: "Carousel",
    category: "pro",
    description: "Image/content carousel slider",
    pro: true,
  },
  {
    id: "slides",
    name: "Slides",
    category: "pro",
    description: "Full-width slide presentations",
    pro: true,
  },
  {
    id: "animated-headline",
    name: "Animated Headline",
    category: "pro",
    description: "Animated text headlines",
    pro: true,
  },
  {
    id: "price-table",
    name: "Price Table",
    category: "pro",
    description: "Pricing comparison tables",
    pro: true,
  },
  {
    id: "flip-box",
    name: "Flip Box",
    category: "pro",
    description: "Flippable content cards",
    pro: true,
  },
  {
    id: "call-to-action",
    name: "Call to Action",
    category: "pro",
    description: "Featured CTA section",
    pro: true,
  },
  {
    id: "media-carousel",
    name: "Media Carousel",
    category: "pro",
    description: "Mixed media carousel",
    pro: true,
  },
  {
    id: "testimonial-carousel",
    name: "Testimonial Carousel",
    category: "pro",
    description: "Rotating testimonials",
    pro: true,
  },
  {
    id: "reviews",
    name: "Reviews",
    category: "pro",
    description: "Customer reviews display",
    pro: true,
  },
  {
    id: "login",
    name: "Login",
    category: "pro",
    description: "User login form",
    pro: true,
  },

  // Site Widgets
  {
    id: "site-logo",
    name: "Site Logo",
    category: "site",
    description: "WordPress site logo",
  },
  {
    id: "site-title",
    name: "Site Title",
    category: "site",
    description: "WordPress site title",
  },
  {
    id: "page-title",
    name: "Page Title",
    category: "site",
    description: "Current page title",
  },
  {
    id: "breadcrumbs",
    name: "Breadcrumbs",
    category: "site",
    description: "Navigation breadcrumb trail",
  },
  {
    id: "search-form",
    name: "Search Form",
    category: "site",
    description: "Site search input",
  },

  // Single Post Widgets
  {
    id: "post-title",
    name: "Post Title",
    category: "single",
    description: "Blog post title",
  },
  {
    id: "post-excerpt",
    name: "Post Excerpt",
    category: "single",
    description: "Post excerpt/summary",
  },
  {
    id: "post-content",
    name: "Post Content",
    category: "single",
    description: "Full post content",
  },
  {
    id: "featured-image",
    name: "Featured Image",
    category: "single",
    description: "Post featured image",
  },
  {
    id: "post-info",
    name: "Post Info",
    category: "single",
    description: "Author, date, categories metadata",
  },
  {
    id: "post-comments",
    name: "Post Comments",
    category: "single",
    description: "Comments section",
  },
  {
    id: "author-box",
    name: "Author Box",
    category: "single",
    description: "Post author biography",
  },

  // WooCommerce Widgets
  {
    id: "woo-products",
    name: "Products",
    category: "woocommerce",
    description: "Product grid/list display",
    woocommerceOnly: true,
    pro: true,
  },
  {
    id: "woo-categories",
    name: "Product Categories",
    category: "woocommerce",
    description: "Product category grid",
    woocommerceOnly: true,
    pro: true,
  },
  {
    id: "woo-add-to-cart",
    name: "Add to Cart",
    category: "woocommerce",
    description: "Add to cart button",
    woocommerceOnly: true,
    pro: true,
  },
  {
    id: "woo-breadcrumbs",
    name: "Product Breadcrumbs",
    category: "woocommerce",
    description: "Product navigation trail",
    woocommerceOnly: true,
    pro: true,
  },
  {
    id: "woo-menu-cart",
    name: "Menu Cart",
    category: "woocommerce",
    description: "Cart icon with item count",
    woocommerceOnly: true,
    pro: true,
  },
  {
    id: "woo-checkout",
    name: "Checkout",
    category: "woocommerce",
    description: "Checkout page form",
    woocommerceOnly: true,
    pro: true,
  },
  {
    id: "woo-cart",
    name: "Cart",
    category: "woocommerce",
    description: "Shopping cart page",
    woocommerceOnly: true,
    pro: true,
  },
  {
    id: "woo-my-account",
    name: "My Account",
    category: "woocommerce",
    description: "Customer account page",
    woocommerceOnly: true,
    pro: true,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  global: "Global Widgets",
  basic: "Basic Widgets",
  general: "General Widgets",
  pro: "Pro Widgets",
  site: "Site Widgets",
  single: "Single Post Widgets",
  woocommerce: "WooCommerce Widgets",
};

export default function WidgetSelector({ value, siteType, onChange }: WidgetSelectorProps) {
  const defaultWidgets = WIDGETS.filter((w) => w.defaultChecked).map((w) => w.id);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(value || defaultWidgets);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter widgets based on search and category
  const filteredWidgets = useMemo(() => {
    let widgets = WIDGETS;

    // Filter out WooCommerce widgets if not e-commerce
    if (siteType !== "ecommerce") {
      widgets = widgets.filter((w) => !w.woocommerceOnly);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      widgets = widgets.filter(
        (w) =>
          w.name.toLowerCase().includes(query) ||
          w.description?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      widgets = widgets.filter((w) => w.category === selectedCategory);
    }

    return widgets;
  }, [searchQuery, selectedCategory, siteType]);

  // Group widgets by category
  const widgetsByCategory = useMemo(() => {
    const grouped: Record<string, Widget[]> = {};
    filteredWidgets.forEach((widget) => {
      if (!grouped[widget.category]) {
        grouped[widget.category] = [];
      }
      grouped[widget.category].push(widget);
    });
    return grouped;
  }, [filteredWidgets]);

  const handleToggleWidget = (widgetId: string) => {
    const newSelection = selectedWidgets.includes(widgetId)
      ? selectedWidgets.filter((id) => id !== widgetId)
      : [...selectedWidgets, widgetId];

    setSelectedWidgets(newSelection);
    onChange?.(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = filteredWidgets.map((w) => w.id);
    setSelectedWidgets(allIds);
    onChange?.(allIds);
  };

  const handleDeselectAll = () => {
    // Keep only global widgets (always required)
    const globalIds = WIDGETS.filter((w) => w.category === "global").map((w) => w.id);
    setSelectedWidgets(globalIds);
    onChange?.(globalIds);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              // Hide WooCommerce category if not e-commerce
              if (key === "woocommerce" && siteType !== "ecommerce") return null;
              return (
                <option key={key} value={key}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSelectAll}
          className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
        >
          Select All
        </button>
        <button
          onClick={handleDeselectAll}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded border border-gray-200 transition-colors"
        >
          Deselect All
        </button>
      </div>

      {/* Widget Count */}
      <div className="text-sm text-gray-600">
        {selectedWidgets.length} widget{selectedWidgets.length !== 1 ? "s" : ""} selected
      </div>

      {/* Widget List by Category */}
      <div className="space-y-6">
        {Object.entries(widgetsByCategory).map(([category, widgets]) => (
          <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{CATEGORY_LABELS[category]}</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className={`
                    p-3 rounded-lg border transition-colors
                    ${
                      selectedWidgets.includes(widget.id)
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                    ${widget.category === "global" ? "opacity-75" : ""}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedWidgets.includes(widget.id)}
                      onChange={() => handleToggleWidget(widget.id)}
                      disabled={widget.category === "global"} // Global widgets always required
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label
                          className={`text-sm font-medium ${
                            widget.category === "global" ? "text-gray-600" : "text-gray-900"
                          }`}
                        >
                          {widget.name}
                        </label>
                        {widget.pro && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            PRO
                          </span>
                        )}
                        {widget.category === "global" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            Required
                          </span>
                        )}
                      </div>
                      {widget.description && (
                        <p className="text-xs text-gray-600 mt-1">{widget.description}</p>
                      )}
                      {widget.characterLimits && (
                        <div className="text-xs text-gray-500 mt-1">
                          Character limits:{" "}
                          {Object.entries(widget.characterLimits)
                            .map(([tag, limit]) => `${tag.toUpperCase()}: ${limit}`)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredWidgets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No widgets found matching your criteria
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Global widgets (Header & Footer) are always required. Select additional
          widgets based on your site needs. Pro widgets require Elementor Pro license.
        </p>
      </div>
    </div>
  );
}
