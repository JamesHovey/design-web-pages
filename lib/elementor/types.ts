/**
 * Elementor Data Structure Type Definitions
 * Based on official Elementor documentation v0.4
 * https://developers.elementor.com/docs/data-structure/
 */

/**
 * Base Elementor Element
 */
export interface ElementorElement {
  id: string; // Unique identification key
  elType: string; // Element type (container, section, column, widget)
  isInner?: boolean; // Whether element is nested
  settings: Record<string, any>; // Configuration from editor controls
  elements?: ElementorElement[]; // Nested child elements
}

/**
 * Elementor Widget Element
 */
export interface ElementorWidget extends ElementorElement {
  elType: "widget";
  widgetType: string; // Specific widget type (heading, image, button, etc.)
}

/**
 * Elementor Container Element
 */
export interface ElementorContainer extends ElementorElement {
  elType: "container";
  settings: {
    content_width?: "boxed" | "full";
    flex_direction?: "row" | "column";
    flex_wrap?: "wrap" | "nowrap";
    flex_gap?: { size: number; unit: string };
    background_background?: "classic" | "gradient";
    background_color?: string;
    padding?: { top: number; right: number; bottom: number; left: number; unit: string };
    [key: string]: any;
  };
}

/**
 * Complete Elementor Document Structure
 */
export interface ElementorDocument {
  title: string; // Document title shown in WordPress dashboard
  type: "page" | "post" | "header" | "footer" | "error-404" | "popup"; // Document type
  version: string; // Structure version (currently 0.4)
  page_settings: Record<string, any> | []; // Page-level settings
  content: ElementorElement[]; // Array of all page elements
}

/**
 * Widget Type Mappings
 */
export type WidgetType =
  // Basic Widgets
  | "heading"
  | "text-editor"
  | "image"
  | "video"
  | "button"
  | "divider"
  | "spacer"
  | "google_maps"
  | "icon"
  | "image-box"
  | "icon-box"
  | "star-rating"
  | "image-carousel"
  | "image-gallery"
  | "icon-list"
  | "counter"
  | "progress"
  | "testimonial"
  | "tabs"
  | "accordion"
  | "toggle"
  | "social-icons"
  | "alert"
  | "audio"
  | "shortcode"
  | "html"
  | "menu-anchor"
  | "sidebar"
  // Pro Widgets
  | "call-to-action"
  | "posts"
  | "portfolio"
  | "gallery"
  | "form"
  | "login"
  | "slides"
  | "nav-menu"
  | "animated-headline"
  | "hotspot"
  | "price-list"
  | "price-table"
  | "flip-box"
  | "blockquote"
  | "countdown"
  | "share-buttons"
  | "facebook-button"
  | "facebook-comments"
  | "facebook-embed"
  | "facebook-page"
  | "mailchimp"
  | "soundcloud"
  | "video-playlist"
  | "table-of-contents"
  | "lottie"
  | "code-highlight"
  | "theme-elements";

/**
 * Common Widget Settings
 */
export interface WidgetSettings {
  // Typography
  typography_typography?: "custom" | "default";
  typography_font_family?: string;
  typography_font_size?: { size: number; unit: string };
  typography_font_weight?: number | string;
  typography_text_transform?: "uppercase" | "lowercase" | "capitalize" | "none";
  typography_line_height?: { size: number; unit: string };
  typography_letter_spacing?: { size: number; unit: string };

  // Colors
  color?: string;
  background_color?: string;

  // Spacing
  padding?: { top: number; right: number; bottom: number; left: number; unit: string };
  margin?: { top: number; right: number; bottom: number; left: number; unit: string };

  // Alignment
  align?: "left" | "center" | "right" | "justify";
  text_align?: "left" | "center" | "right" | "justify";

  // Animation
  _animation?: string;
  _animation_delay?: number;

  // Custom CSS
  _css_classes?: string;

  [key: string]: any;
}

/**
 * Heading Widget Settings
 */
export interface HeadingSettings extends WidgetSettings {
  title: string;
  header_size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  link?: { url: string; is_external: boolean; nofollow: boolean };
}

/**
 * Image Widget Settings
 */
export interface ImageSettings extends WidgetSettings {
  image: { url: string; id?: number };
  image_size?: "thumbnail" | "medium" | "large" | "full" | "custom";
  caption?: string;
  link_to?: "none" | "file" | "custom";
  link?: { url: string; is_external: boolean; nofollow: boolean };
  hover_animation?: string;
}

/**
 * Video Widget Settings
 */
export interface VideoSettings extends WidgetSettings {
  video_type: "youtube" | "vimeo" | "dailymotion" | "hosted";
  youtube_url?: string;
  vimeo_url?: string;
  hosted_url?: { url: string };
  start?: number;
  end?: number;
  autoplay?: "yes" | "no";
  mute?: "yes" | "no";
  loop?: "yes" | "no";
  controls?: "yes" | "no";
  modest_branding?: "yes" | "no";
  privacy_mode?: "yes" | "no";
  lazy_load?: "yes" | "no";
  aspect_ratio?: "169" | "219" | "43" | "32" | "11";
  show_image_overlay?: "yes" | "no";
  image_overlay?: { url: string; id?: number };
  play_icon_color?: string;
  play_icon_size?: { size: number; unit: string };
}

/**
 * Button Widget Settings
 */
export interface ButtonSettings extends WidgetSettings {
  text: string;
  link: { url: string; is_external: boolean; nofollow: boolean };
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  icon?: { value: string; library: string };
  icon_align?: "left" | "right";
  button_type?: "default" | "info" | "success" | "warning" | "danger";
  hover_animation?: string;
}

/**
 * Container Settings
 */
export interface ContainerSettings extends WidgetSettings {
  content_width?: "boxed" | "full";
  flex_direction?: "row" | "column";
  flex_wrap?: "wrap" | "nowrap";
  flex_gap?: { size: number; unit: string; sizes: any[] };
  justify_content?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
  align_items?: "flex-start" | "center" | "flex-end" | "stretch";
  html_tag?: "div" | "section" | "article" | "main" | "header" | "footer" | "aside" | "nav";
  height?: "default" | "full" | "min-height";
  min_height?: { size: number; unit: string };
}
