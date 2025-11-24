/**
 * Elementor HTML Generation Utilities
 * Generates Elementor-compatible HTML structure with proper classes and data attributes
 */

import type { ElementorWidget, ElementorContainer, WidgetSettings } from "./types";

/**
 * Generate unique Elementor-style ID
 */
export function generateElementorId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Generate data attributes for an element
 */
function generateDataAttributes(element: { id: string; elType: string; widgetType?: string; settings?: any }): string {
  const attrs = [
    `data-id="${element.id}"`,
    `data-element_type="${element.elType}"`,
  ];

  if (element.widgetType) {
    attrs.push(`data-widget_type="${element.widgetType}.default"`);
  }

  if (element.settings && Object.keys(element.settings).length > 0) {
    // Sanitize settings for HTML attribute
    const settingsJson = JSON.stringify(element.settings).replace(/"/g, "&quot;");
    attrs.push(`data-settings="${settingsJson}"`);
  }

  return attrs.join(" ");
}

/**
 * Generate Elementor container HTML
 */
export function generateContainerHTML(
  container: ElementorContainer,
  childrenHTML: string
): string {
  const id = container.id || generateElementorId();
  const settings = container.settings || {};
  const isBoxed = settings.content_width === "boxed" || !settings.content_width;

  return `<div class="elementor-element e-flex ${isBoxed ? "e-con-boxed" : "e-con-full"} e-con e-parent" ${generateDataAttributes({ id, elType: "container", settings })}>
    <div class="e-con-inner">
      ${childrenHTML}
    </div>
  </div>`;
}

/**
 * Generate Elementor widget wrapper HTML
 */
function generateWidgetWrapper(widgetType: string, id: string, settings: any, innerHTML: string): string {
  return `<div class="elementor-element elementor-widget elementor-widget-${widgetType}" ${generateDataAttributes({ id, elType: "widget", widgetType, settings })}>
    <div class="elementor-widget-container">
      ${innerHTML}
    </div>
  </div>`;
}

/**
 * Generate Heading Widget HTML
 */
export function generateHeadingWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const level = widget.level || widget.settings?.header_size || "h2";
  const text = widget.text || widget.settings?.title || "Heading";
  const align = widget.settings?.align || "left";

  const innerHTML = `<${level} class="elementor-heading-title elementor-size-default">${text}</${level}>`;

  return generateWidgetWrapper("heading", id, widget.settings, innerHTML);
}

/**
 * Generate Image Widget HTML
 */
export function generateImageWidget(widget: any, mediaUrl?: string): string {
  const id = widget.id || generateElementorId();
  const imgUrl = widget.url || widget.settings?.image?.url || mediaUrl || "https://via.placeholder.com/800x600?text=Image";
  const alt = widget.alt || widget.settings?.caption || "Image";

  const innerHTML = `<img decoding="async" width="800" height="600" src="${imgUrl}" class="attachment-large size-large wp-image-${id}" alt="${alt}" loading="lazy" />`;

  return generateWidgetWrapper("image", id, widget.settings, innerHTML);
}

/**
 * Generate Video Widget HTML
 */
export function generateVideoWidget(widget: any, mediaUrl?: string): string {
  const id = widget.id || generateElementorId();
  const settings = widget.settings || {};
  const videoType = settings.video_type || "hosted";
  const videoUrl = widget.url || settings.hosted_url?.url || settings.youtube_url || mediaUrl || "";

  let innerHTML = "";

  if (videoType === "youtube" && settings.youtube_url) {
    const videoId = settings.youtube_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1] || "";
    innerHTML = `<div class="elementor-wrapper elementor-open-inline">
      <iframe class="elementor-video-iframe" allowfullscreen="" title="youtube Video Player" src="https://www.youtube.com/embed/${videoId}?feature=oembed&start&end&wmode=opaque&loop=0&controls=1&mute=0&rel=0&modestbranding=0"></iframe>
    </div>`;
  } else if (videoUrl) {
    innerHTML = `<div class="elementor-wrapper elementor-open-inline">
      <div class="elementor-video">
        <video class="elementor-video-player" controls preload="metadata" controlslist="nodownload">
          <source src="${videoUrl}" type="video/mp4">
        </video>
      </div>
    </div>`;
  }

  return generateWidgetWrapper("video", id, settings, innerHTML);
}

/**
 * Generate Button Widget HTML
 */
export function generateButtonWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const text = widget.text || widget.settings?.text || "Click Here";
  const link = widget.link || widget.settings?.link?.url || "#";
  const size = widget.settings?.size || "sm";

  const innerHTML = `<div class="elementor-button-wrapper">
    <a class="elementor-button elementor-button-link elementor-size-${size}" href="${link}" role="button">
      <span class="elementor-button-content-wrapper">
        <span class="elementor-button-text">${text}</span>
      </span>
    </a>
  </div>`;

  return generateWidgetWrapper("button", id, widget.settings, innerHTML);
}

/**
 * Generate Divider Widget HTML
 */
export function generateDividerWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const style = widget.style || widget.settings?.style || "solid";
  const weight = widget.width || widget.settings?.weight?.size || 1;

  const innerHTML = `<div class="elementor-divider" style="--divider-border-style: ${style}; --divider-border-width: ${weight}px;">
    <span class="elementor-divider-separator"></span>
  </div>`;

  return generateWidgetWrapper("divider", id, widget.settings, innerHTML);
}

/**
 * Generate Spacer Widget HTML
 */
export function generateSpacerWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const height = widget.height || widget.settings?.space?.size || 50;

  const innerHTML = `<div class="elementor-spacer">
    <div class="elementor-spacer-inner" style="height: ${height}px;"></div>
  </div>`;

  return generateWidgetWrapper("spacer", id, widget.settings, innerHTML);
}

/**
 * Generate Google Maps Widget HTML
 */
export function generateGoogleMapsWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const address = widget.address || widget.settings?.address || "New York, NY";
  const zoom = widget.zoom || widget.settings?.zoom?.size || 12;

  const innerHTML = `<div class="elementor-custom-embed">
    <iframe loading="lazy" src="https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=m&z=${zoom}&output=embed&iwloc=near" title="${address}" aria-label="${address}"></iframe>
  </div>`;

  return generateWidgetWrapper("google_maps", id, widget.settings, innerHTML);
}

/**
 * Generate Icon Widget HTML
 */
export function generateIconWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const icon = widget.icon || widget.settings?.selected_icon?.value || "★";
  const view = widget.settings?.view || "default";

  const innerHTML = `<div class="elementor-icon-wrapper">
    <div class="elementor-icon elementor-view-${view}">
      <span class="elementor-icon-svg">${icon}</span>
    </div>
  </div>`;

  return generateWidgetWrapper("icon", id, widget.settings, innerHTML);
}

/**
 * Generate Text Editor Widget HTML
 */
export function generateTextEditorWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const text = widget.text || widget.settings?.editor || "Content text goes here.";

  const innerHTML = `<div class="elementor-text-editor elementor-clearfix">${text}</div>`;

  return generateWidgetWrapper("text-editor", id, widget.settings, innerHTML);
}

/**
 * Generate Icon Box Widget HTML
 */
export function generateIconBoxWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const icon = widget.icon || "★";
  const title = widget.title || widget.settings?.title_text || "Feature Title";
  const description = widget.description || widget.settings?.description_text || "Feature description goes here.";

  const innerHTML = `<div class="elementor-icon-box-wrapper">
    <div class="elementor-icon-box-icon">
      <span class="elementor-icon elementor-animation-">${icon}</span>
    </div>
    <div class="elementor-icon-box-content">
      <h3 class="elementor-icon-box-title">
        <span>${title}</span>
      </h3>
      <p class="elementor-icon-box-description">${description}</p>
    </div>
  </div>`;

  return generateWidgetWrapper("icon-box", id, widget.settings, innerHTML);
}

/**
 * Generate Image Box Widget HTML
 */
export function generateImageBoxWidget(widget: any, mediaUrl?: string): string {
  const id = widget.id || generateElementorId();
  const imgUrl = widget.url || widget.settings?.image?.url || mediaUrl || "https://via.placeholder.com/400x300?text=Image+Box";
  const title = widget.title || widget.settings?.title_text || "Image Box Title";
  const description = widget.description || widget.settings?.description_text || "Description text.";

  const innerHTML = `<div class="elementor-image-box-wrapper">
    <figure class="elementor-image-box-img">
      <img decoding="async" src="${imgUrl}" class="attachment-full size-full wp-image-${id}" alt="${title}" loading="lazy" />
    </figure>
    <div class="elementor-image-box-content">
      <h3 class="elementor-image-box-title">${title}</h3>
      <p class="elementor-image-box-description">${description}</p>
    </div>
  </div>`;

  return generateWidgetWrapper("image-box", id, widget.settings, innerHTML);
}

/**
 * Generate Testimonial Widget HTML
 */
export function generateTestimonialWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const text = widget.text || widget.settings?.testimonial_content || "This is a great testimonial.";
  const name = widget.name || widget.settings?.testimonial_name || "John Doe";
  const position = widget.position || widget.settings?.testimonial_job || "Customer";

  const innerHTML = `<div class="elementor-testimonial-wrapper">
    <div class="elementor-testimonial-content">${text}</div>
    <div class="elementor-testimonial-meta">
      <div class="elementor-testimonial-meta-inner">
        <div class="elementor-testimonial-details">
          <div class="elementor-testimonial-name">${name}</div>
          <div class="elementor-testimonial-job">${position}</div>
        </div>
      </div>
    </div>
  </div>`;

  return generateWidgetWrapper("testimonial", id, widget.settings, innerHTML);
}

/**
 * Generate Star Rating Widget HTML
 */
export function generateStarRatingWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const rating = widget.rating || widget.settings?.rating?.size || 5;
  const maxRating = 5;

  const innerHTML = `<div class="elementor-star-rating">
    ${Array.from({ length: maxRating }, (_, i) =>
      `<i class="${i < rating ? 'fas fa-star' : 'far fa-star'}" aria-hidden="true"></i>`
    ).join('\n    ')}
  </div>`;

  return generateWidgetWrapper("star-rating", id, widget.settings, innerHTML);
}

/**
 * Generate Social Icons Widget HTML
 */
export function generateSocialIconsWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const icons = widget.icons || widget.settings?.social_icon_list || [
    { social: "facebook", link: { url: "#" } },
    { social: "twitter", link: { url: "#" } },
    { social: "instagram", link: { url: "#" } }
  ];

  const innerHTML = `<div class="elementor-social-icons-wrapper elementor-grid">
    ${icons.map((icon: any) => `
      <span class="elementor-grid-item">
        <a class="elementor-icon elementor-social-icon elementor-social-icon-${icon.social || icon.platform?.toLowerCase()}" href="${icon.url || icon.link?.url || '#'}" target="_blank">
          <span class="elementor-screen-only">${icon.social || icon.platform}</span>
          <i class="fab fa-${icon.social || icon.platform?.toLowerCase()}"></i>
        </a>
      </span>
    `).join('')}
  </div>`;

  return generateWidgetWrapper("social-icons", id, widget.settings, innerHTML);
}

/**
 * Generate Counter Widget HTML
 */
export function generateCounterWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const endNumber = widget.endNumber || widget.settings?.ending_number || 100;
  const title = widget.title || widget.settings?.title || "Counter Title";

  const innerHTML = `<div class="elementor-counter">
    <div class="elementor-counter-number-wrapper">
      <span class="elementor-counter-number" data-duration="2000" data-to-value="${endNumber}">${endNumber}</span>
    </div>
    <div class="elementor-counter-title">${title}</div>
  </div>`;

  return generateWidgetWrapper("counter", id, widget.settings, innerHTML);
}

/**
 * Generate Progress Bar Widget HTML
 */
export function generateProgressWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const title = widget.title || widget.settings?.title || "Skill";
  const percent = widget.percent || widget.settings?.percent?.size || 80;

  const innerHTML = `<div class="elementor-progress-wrapper" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
    <div class="elementor-progress-bar" data-max="${percent}">
      <span class="elementor-progress-text">${title}</span>
      <span class="elementor-progress-percentage">${percent}%</span>
      <div class="elementor-progress-bar-fill" style="width: ${percent}%;"></div>
    </div>
  </div>`;

  return generateWidgetWrapper("progress", id, widget.settings, innerHTML);
}

/**
 * Generate Accordion Widget HTML
 */
export function generateAccordionWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const items = widget.items || widget.settings?.tabs || [
    { title: "Item 1", content: "Content 1" },
    { title: "Item 2", content: "Content 2" }
  ];

  const innerHTML = `<div class="elementor-accordion" role="tablist">
    ${items.map((item: any, i: number) => `
      <div class="elementor-accordion-item">
        <div class="elementor-tab-title ${i === 0 ? 'elementor-active' : ''}" data-tab="${i + 1}" role="tab" aria-controls="elementor-tab-content-${id}${i + 1}">
          <span class="elementor-accordion-icon elementor-accordion-icon-${i === 0 ? 'closed' : 'opened'}" aria-hidden="true">
            <span class="elementor-accordion-icon-closed"><i class="fas fa-plus"></i></span>
            <span class="elementor-accordion-icon-opened"><i class="fas fa-minus"></i></span>
          </span>
          <a class="elementor-accordion-title" tabindex="0">${item.title}</a>
        </div>
        <div id="elementor-tab-content-${id}${i + 1}" class="elementor-tab-content elementor-clearfix ${i === 0 ? 'elementor-active' : ''}" data-tab="${i + 1}" role="tabpanel">
          <p>${item.content}</p>
        </div>
      </div>
    `).join('')}
  </div>`;

  return generateWidgetWrapper("accordion", id, widget.settings, innerHTML);
}

/**
 * Generate Tabs Widget HTML
 */
export function generateTabsWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const tabs = widget.tabs || widget.settings?.tabs || [
    { title: "Tab 1", content: "Tab content 1" },
    { title: "Tab 2", content: "Tab content 2" }
  ];

  const innerHTML = `<div class="elementor-tabs" role="tablist">
    <div class="elementor-tabs-wrapper" role="tablist">
      ${tabs.map((tab: any, i: number) => `
        <div class="elementor-tab-title ${i === 0 ? 'elementor-active' : ''}" data-tab="${i + 1}" role="tab" tabindex="${i === 0 ? '0' : '-1'}">
          <a href="#">${tab.title}</a>
        </div>
      `).join('')}
    </div>
    <div class="elementor-tabs-content-wrapper">
      ${tabs.map((tab: any, i: number) => `
        <div class="elementor-tab-content elementor-clearfix ${i === 0 ? 'elementor-active' : ''}" data-tab="${i + 1}" role="tabpanel">
          <p>${tab.content}</p>
        </div>
      `).join('')}
    </div>
  </div>`;

  return generateWidgetWrapper("tabs", id, widget.settings, innerHTML);
}

/**
 * Generate Alert Widget HTML
 */
export function generateAlertWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const type = widget.type || widget.settings?.alert_type || "info";
  const text = widget.text || widget.settings?.alert_description || "This is an alert message.";

  const innerHTML = `<div class="elementor-alert elementor-alert-${type}" role="alert">
    <span class="elementor-alert-description">${text}</span>
  </div>`;

  return generateWidgetWrapper("alert", id, widget.settings, innerHTML);
}

/**
 * Generate Call To Action Widget HTML (Pro)
 */
export function generateCallToActionWidget(widget: any, project: any): string {
  const id = widget.id || generateElementorId();
  const title = widget.title || widget.settings?.title || "Ready to Get Started?";
  const description = widget.description || widget.settings?.description || "Join thousands of satisfied customers today.";
  const buttonText = widget.buttonText || widget.settings?.button?.text || "Get Started Now";
  const buttonLink = widget.buttonLink || widget.settings?.button?.url || "#";

  const innerHTML = `<div class="elementor-cta">
    <div class="elementor-cta__content">
      <h2 class="elementor-cta__title">${title}</h2>
      <div class="elementor-cta__description">${description}</div>
      <div class="elementor-cta__button-wrapper">
        <a class="elementor-cta__button elementor-button elementor-size-sm" href="${buttonLink}">${buttonText}</a>
      </div>
    </div>
  </div>`;

  return generateWidgetWrapper("call-to-action", id, widget.settings, innerHTML);
}

/**
 * Generate widget HTML based on type
 */
export function generateWidgetHTML(widget: any, mediaAssets?: any[], project?: any): string {
  const getMedia = (type: "image" | "video", index = 0) => {
    if (!mediaAssets) return null;
    const filtered = mediaAssets.filter((m: any) => m.type === type);
    return filtered[index % Math.max(filtered.length, 1)] || null;
  };

  switch (widget.type) {
    case "heading":
      return generateHeadingWidget(widget);
    case "image": {
      const img = getMedia("image", 0);
      return generateImageWidget(widget, img?.url);
    }
    case "video": {
      const vid = getMedia("video", 0);
      return generateVideoWidget(widget, vid?.url);
    }
    case "button":
      return generateButtonWidget(widget);
    case "divider":
      return generateDividerWidget(widget);
    case "spacer":
      return generateSpacerWidget(widget);
    case "google_maps":
      return generateGoogleMapsWidget(widget);
    case "icon":
      return generateIconWidget(widget);
    case "text-editor":
      return generateTextEditorWidget(widget);
    case "icon-box":
      return generateIconBoxWidget(widget);
    case "image-box": {
      const img = getMedia("image", 0);
      return generateImageBoxWidget(widget, img?.url);
    }
    case "testimonial":
      return generateTestimonialWidget(widget);
    case "star-rating":
      return generateStarRatingWidget(widget);
    case "social-icons":
      return generateSocialIconsWidget(widget);
    case "counter":
      return generateCounterWidget(widget);
    case "progress":
    case "progress-bar":
      return generateProgressWidget(widget);
    case "accordion":
      return generateAccordionWidget(widget);
    case "tabs":
      return generateTabsWidget(widget);
    case "alert":
      return generateAlertWidget(widget);
    case "call-to-action":
      return generateCallToActionWidget(widget, project);
    default:
      // Fallback for unsupported widgets - return placeholder comment
      return `<!-- Elementor widget type "${widget.type}" not yet implemented -->`;
  }
}
