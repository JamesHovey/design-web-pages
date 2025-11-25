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
  const iconType = widget.icon || "star";
  const text = widget.text || widget.title || widget.settings?.title_text || "Feature Title";
  const description = widget.description || widget.settings?.description_text || "";
  const alignment = widget.alignment || "left";
  const isHeader = widget.isHeader || false;
  const link = widget.link || widget.settings?.link?.url || "#";

  // SVG Icons for professional header elements
  const iconMap: Record<string, string> = {
    phone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
    email: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
    location: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    chat: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    star: '★'
  };

  const iconHTML = iconMap[iconType] || iconMap.star;

  // Create proper link href based on type
  let href = link;
  if (link === "#" || link === "") {
    if (iconType === "phone") {
      href = `tel:${text.replace(/[^0-9+]/g, "")}`;
    } else if (iconType === "email") {
      href = `mailto:${text}`;
    }
  }

  // Header-style icon box (compact, horizontal, prominent for contact info)
  if (isHeader) {
    const innerHTML = `<a href="${href}" class="header-icon-box-link" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; transition: var(--professional-transition); padding: var(--spacing-xs) var(--spacing-sm); border-radius: var(--radius-sm);">
      <div class="header-icon-box-icon" style="flex-shrink: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
        ${iconHTML}
      </div>
      <div class="header-icon-box-content" style="line-height: 1.3;">
        ${description ? `<div class="header-icon-box-label" style="font-size: 12px; opacity: 0.75; font-weight: 500; margin-bottom: 2px;">${description}</div>` : ''}
        <div class="header-icon-box-text" style="font-size: ${description ? '16px' : '15px'}; font-weight: 600; white-space: nowrap;">${text}</div>
      </div>
    </a>`;

    return generateWidgetWrapper("icon-box", id, widget.settings, innerHTML);
  }

  // Standard icon box (feature boxes for body content)
  const innerHTML = `<div class="elementor-icon-box-wrapper" style="text-align: ${alignment};">
    <div class="elementor-icon-box-icon">
      <span class="elementor-icon elementor-animation-">${iconType === 'star' ? iconHTML : `<span class="elementor-icon-svg">${iconHTML}</span>`}</span>
    </div>
    <div class="elementor-icon-box-content">
      <h3 class="elementor-icon-box-title">
        <span>${text}</span>
      </h3>
      ${description ? `<p class="elementor-icon-box-description">${description}</p>` : ''}
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
 * Generate Image Gallery Widget HTML
 */
export function generateImageGalleryWidget(widget: any, mediaAssets?: any[]): string {
  const id = widget.id || generateElementorId();
  const count = widget.count || widget.settings?.gallery?.length || 6;

  const images = Array.from({ length: count }, (_, i) => {
    if (mediaAssets && mediaAssets.length > 0) {
      const img = mediaAssets[i % mediaAssets.length];
      return img?.url || `https://via.placeholder.com/400x300?text=Gallery+${i + 1}`;
    }
    return `https://via.placeholder.com/400x300?text=Gallery+${i + 1}`;
  });

  const innerHTML = `<div class="elementor-gallery elementor-gallery-grid">
    ${images.map((url, i) => `
      <div class="elementor-gallery-item">
        <a href="${url}" class="elementor-gallery-item-link">
          <img src="${url}" alt="Gallery Image ${i + 1}" class="elementor-gallery-item-image" loading="lazy" />
          <div class="elementor-gallery-item-overlay">
            <i class="fas fa-search-plus"></i>
          </div>
        </a>
      </div>
    `).join('')}
  </div>`;

  return generateWidgetWrapper("image-gallery", id, widget.settings, innerHTML);
}

/**
 * Generate Image Carousel Widget HTML
 */
export function generateImageCarouselWidget(widget: any, mediaAssets?: any[]): string {
  const id = widget.id || generateElementorId();
  const count = widget.count || widget.settings?.slides?.length || 3;

  const slides = Array.from({ length: count }, (_, i) => {
    if (mediaAssets && mediaAssets.length > 0) {
      const img = mediaAssets[i % mediaAssets.length];
      return img?.url || `https://via.placeholder.com/1200x500?text=Slide+${i + 1}`;
    }
    return `https://via.placeholder.com/1200x500?text=Slide+${i + 1}`;
  });

  const innerHTML = `<div class="elementor-image-carousel">
    <div class="elementor-carousel-slides">
      ${slides.map((url, i) => `
        <div class="elementor-carousel-slide ${i === 0 ? 'active' : ''}">
          <img src="${url}" alt="Slide ${i + 1}" />
        </div>
      `).join('')}
    </div>
    <button class="elementor-carousel-nav elementor-carousel-prev" aria-label="Previous">
      <i class="fas fa-chevron-left"></i>
    </button>
    <button class="elementor-carousel-nav elementor-carousel-next" aria-label="Next">
      <i class="fas fa-chevron-right"></i>
    </button>
    <div class="elementor-carousel-indicators">
      ${slides.map((_, i) => `
        <button class="elementor-carousel-indicator ${i === 0 ? 'active' : ''}" data-slide="${i}"></button>
      `).join('')}
    </div>
  </div>`;

  return generateWidgetWrapper("image-carousel", id, widget.settings, innerHTML);
}

/**
 * Generate Icon List Widget HTML
 */
export function generateIconListWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const items = widget.items || widget.settings?.icon_list || [
    { text: "List Item 1", icon: "fas fa-check" },
    { text: "List Item 2", icon: "fas fa-check" },
    { text: "List Item 3", icon: "fas fa-check" }
  ];

  const innerHTML = `<ul class="elementor-icon-list-items">
    ${items.map((item: any) => `
      <li class="elementor-icon-list-item">
        <span class="elementor-icon-list-icon">
          <i class="${item.icon || 'fas fa-check'}" aria-hidden="true"></i>
        </span>
        <span class="elementor-icon-list-text">${item.text || item.title || "List Item"}</span>
      </li>
    `).join('')}
  </ul>`;

  return generateWidgetWrapper("icon-list", id, widget.settings, innerHTML);
}

/**
 * Generate Toggle Widget HTML
 */
export function generateToggleWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const items = widget.items || widget.settings?.tabs || [
    { title: "Toggle Item 1", content: "Content for toggle 1" },
    { title: "Toggle Item 2", content: "Content for toggle 2" }
  ];

  const innerHTML = `<div class="elementor-toggle" role="tablist">
    ${items.map((item: any, i: number) => `
      <div class="elementor-toggle-item">
        <div class="elementor-tab-title" data-tab="${i + 1}" role="tab">
          <span class="elementor-toggle-icon elementor-toggle-icon-closed">
            <i class="fas fa-plus"></i>
          </span>
          <span class="elementor-toggle-icon elementor-toggle-icon-opened">
            <i class="fas fa-minus"></i>
          </span>
          <a class="elementor-toggle-title" tabindex="0">${item.title}</a>
        </div>
        <div class="elementor-tab-content elementor-clearfix" data-tab="${i + 1}" role="tabpanel">
          <p>${item.content}</p>
        </div>
      </div>
    `).join('')}
  </div>`;

  return generateWidgetWrapper("toggle", id, widget.settings, innerHTML);
}

/**
 * Generate HTML Widget HTML
 */
export function generateHTMLWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const html = widget.html || widget.settings?.html || "<p>Custom HTML content</p>";

  const innerHTML = `<div class="elementor-html-widget">
    ${html}
  </div>`;

  return generateWidgetWrapper("html", id, widget.settings, innerHTML);
}

/**
 * Generate Audio Widget HTML
 */
export function generateAudioWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const audioUrl = widget.url || widget.settings?.audio_url || "";

  const innerHTML = `<div class="elementor-audio-widget">
    <audio controls class="elementor-audio-player">
      <source src="${audioUrl}" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
  </div>`;

  return generateWidgetWrapper("audio", id, widget.settings, innerHTML);
}

/**
 * Generate Form Widget HTML (Pro)
 */
export function generateFormWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const fields = widget.fields || widget.settings?.form_fields || [
    { type: "text", label: "Name", placeholder: "Your name", required: true },
    { type: "email", label: "Email", placeholder: "your@email.com", required: true },
    { type: "textarea", label: "Message", placeholder: "Your message", required: false }
  ];
  const buttonText = widget.buttonText || widget.settings?.button_text || "Submit";

  const innerHTML = `<form class="elementor-form">
    ${fields.map((field: any, i: number) => {
      const fieldId = `form-field-${id}-${i}`;
      if (field.type === "textarea") {
        return `
          <div class="elementor-field-group elementor-column elementor-col-100">
            <label for="${fieldId}" class="elementor-field-label">${field.label}${field.required ? ' *' : ''}</label>
            <textarea id="${fieldId}" name="form_fields[${field.label.toLowerCase()}]" class="elementor-field elementor-size-sm" rows="4" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>
          </div>
        `;
      }
      return `
        <div class="elementor-field-group elementor-column elementor-col-100">
          <label for="${fieldId}" class="elementor-field-label">${field.label}${field.required ? ' *' : ''}</label>
          <input type="${field.type || 'text'}" id="${fieldId}" name="form_fields[${field.label.toLowerCase()}]" class="elementor-field elementor-size-sm" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} />
        </div>
      `;
    }).join('')}
    <div class="elementor-field-group elementor-column elementor-col-100">
      <button type="submit" class="elementor-button elementor-size-sm">
        <span class="elementor-button-text">${buttonText}</span>
      </button>
    </div>
  </form>`;

  return generateWidgetWrapper("form", id, widget.settings, innerHTML);
}

/**
 * Generate Price Table Widget HTML (Pro)
 */
export function generatePriceTableWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const title = widget.title || widget.settings?.heading || "Basic Plan";
  const price = widget.price || widget.settings?.price || "29";
  const currency = widget.currency || widget.settings?.currency_symbol || "$";
  const period = widget.period || widget.settings?.period || "mo";
  const features = widget.features || widget.settings?.features_list || [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ];
  const buttonText = widget.buttonText || widget.settings?.button_text || "Get Started";
  const buttonLink = widget.buttonLink || widget.settings?.link?.url || "#";
  const featured = widget.featured || widget.settings?.featured === "yes";

  const innerHTML = `<div class="elementor-price-table ${featured ? 'elementor-price-table-featured' : ''}">
    ${featured ? '<div class="elementor-price-table-ribbon"><span>Popular</span></div>' : ''}
    <div class="elementor-price-table-header">
      <h3 class="elementor-price-table-heading">${title}</h3>
    </div>
    <div class="elementor-price-table-price">
      <span class="elementor-price-table-currency">${currency}</span>
      <span class="elementor-price-table-integer">${price}</span>
      <span class="elementor-price-table-period">/${period}</span>
    </div>
    <ul class="elementor-price-table-features-list">
      ${features.map((feature: any) => `
        <li class="elementor-price-table-feature-item">
          <i class="fas fa-check elementor-price-table-feature-icon"></i>
          <span>${typeof feature === 'string' ? feature : feature.text}</span>
        </li>
      `).join('')}
    </ul>
    <div class="elementor-price-table-footer">
      <a href="${buttonLink}" class="elementor-price-table-button elementor-button elementor-size-md">
        ${buttonText}
      </a>
    </div>
  </div>`;

  return generateWidgetWrapper("price-table", id, widget.settings, innerHTML);
}

/**
 * Generate Flip Box Widget HTML (Pro)
 */
export function generateFlipBoxWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const frontTitle = widget.frontTitle || widget.settings?.front_title || "Front Title";
  const frontDescription = widget.frontDescription || widget.settings?.front_description || "Front description";
  const backTitle = widget.backTitle || widget.settings?.back_title || "Back Title";
  const backDescription = widget.backDescription || widget.settings?.back_description || "Back description";
  const buttonText = widget.buttonText || widget.settings?.button_text;
  const buttonLink = widget.buttonLink || widget.settings?.link?.url || "#";

  const innerHTML = `<div class="elementor-flip-box">
    <div class="elementor-flip-box-layer elementor-flip-box-front">
      <div class="elementor-flip-box-layer-inner">
        <h3 class="elementor-flip-box-layer-title">${frontTitle}</h3>
        <div class="elementor-flip-box-layer-description">${frontDescription}</div>
      </div>
    </div>
    <div class="elementor-flip-box-layer elementor-flip-box-back">
      <div class="elementor-flip-box-layer-inner">
        <h3 class="elementor-flip-box-layer-title">${backTitle}</h3>
        <div class="elementor-flip-box-layer-description">${backDescription}</div>
        ${buttonText ? `
          <a href="${buttonLink}" class="elementor-flip-box-button elementor-button elementor-size-sm">
            ${buttonText}
          </a>
        ` : ''}
      </div>
    </div>
  </div>`;

  return generateWidgetWrapper("flip-box", id, widget.settings, innerHTML);
}

/**
 * Generate Countdown Widget HTML (Pro)
 */
export function generateCountdownWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const dueDate = widget.dueDate || widget.settings?.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const innerHTML = `<div class="elementor-countdown-wrapper">
    <div class="elementor-countdown-item">
      <span class="elementor-countdown-digits" data-type="days">7</span>
      <span class="elementor-countdown-label">Days</span>
    </div>
    <div class="elementor-countdown-item">
      <span class="elementor-countdown-digits" data-type="hours">12</span>
      <span class="elementor-countdown-label">Hours</span>
    </div>
    <div class="elementor-countdown-item">
      <span class="elementor-countdown-digits" data-type="minutes">34</span>
      <span class="elementor-countdown-label">Minutes</span>
    </div>
    <div class="elementor-countdown-item">
      <span class="elementor-countdown-digits" data-type="seconds">56</span>
      <span class="elementor-countdown-label">Seconds</span>
    </div>
  </div>`;

  return generateWidgetWrapper("countdown", id, widget.settings, innerHTML);
}

/**
 * Generate Animated Headline Widget HTML (Pro)
 */
export function generateAnimatedHeadlineWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const beforeText = widget.beforeText || widget.settings?.before_text || "We are";
  const animatedText = widget.animatedText || widget.settings?.rotating_text || ["Creative", "Professional", "Innovative"];
  const afterText = widget.afterText || widget.settings?.after_text || "";

  const innerHTML = `<div class="elementor-headline">
    <span class="elementor-headline-plain-text elementor-headline-text-wrapper">${beforeText} </span>
    <div class="elementor-headline-dynamic-wrapper elementor-headline-text-wrapper">
      <span class="elementor-headline-dynamic-text elementor-headline-text-active">${Array.isArray(animatedText) ? animatedText[0] : animatedText}</span>
    </div>
    ${afterText ? `<span class="elementor-headline-plain-text elementor-headline-text-wrapper"> ${afterText}</span>` : ''}
  </div>`;

  return generateWidgetWrapper("animated-headline", id, widget.settings, innerHTML);
}

/**
 * Generate Site Logo Widget HTML (Header) - PROFESSIONAL PATTERN
 */
export function generateSiteLogoWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const width = widget.width || 180;
  const height = widget.height || 60;
  const alt = widget.alt || "Site Logo";
  const imageUrl = widget.imageUrl || null;

  const innerHTML = imageUrl
    ? `<a class="the7-logo-wrap img-css-resize-wrapper" href="/" style="display: inline-block;">
        <img src="${imageUrl}" alt="${alt}" width="${width}" height="${height}" class="elementor-site-logo" style="max-width: 100%; height: auto;" />
      </a>`
    : `<a class="the7-logo-wrap img-css-resize-wrapper" href="/" style="display: inline-block;">
        <div class="elementor-site-logo-placeholder" style="width: ${width}px; height: ${height}px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--secondary-color, #764ba2) 100%); color: white; font-weight: bold; font-size: 24px; border-radius: var(--radius-sm); box-shadow: var(--professional-shadow);">
          ${alt.split(' ')[0] || 'LOGO'}
        </div>
      </a>`;

  return `<div class="elementor-element elementor-element-${id} content-align-center sticky-logo-style-y sticky-logo-y elementor-widget elementor-widget-the7-logo-widget" data-id="${id}" data-element_type="widget" data-widget_type="the7-logo-widget.default">
    <div class="elementor-widget-container">
      ${innerHTML}
    </div>
  </div>`;
}

/**
 * Generate Nav Menu Widget HTML (Header) - PROFESSIONAL PATTERN
 */
export function generateNavMenuWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const items = widget.items || [];
  const style = widget.style || "horizontal";
  const alignment = widget.alignment || "center";

  const innerHTML = `<nav class="dt-nav-menu-horizontal--main dt-nav-menu-horizontal__container justify-content-${alignment === 'center' ? 'center' : alignment === 'right' ? 'end' : 'start'}">
    <ul class="dt-nav-menu-horizontal d-flex flex-row justify-content-${alignment === 'center' ? 'center' : alignment === 'right' ? 'end' : 'start'}" style="list-style: none; margin: 0; padding: 0; display: flex; gap: var(--spacing-md); align-items: center;">
      ${items.map((item: any, i: number) => `
        <li class="menu-item ${i === 0 ? 'current-menu-item' : ''}" style="position: relative;">
          <a href="${typeof item === 'object' ? (item.link || '#') : '#'}" class="elementor-nav-menu-link" style="display: block; padding: var(--spacing-sm) var(--spacing-md); text-decoration: none; color: #333; font-weight: 500; font-size: 16px; transition: var(--professional-transition); border-radius: var(--radius-sm);">
            <span class="menu-item-text">${typeof item === 'object' ? item.text : item}</span>
          </a>
        </li>
      `).join('')}
    </ul>
  </nav>`;

  return `<div class="elementor-element elementor-element-${id} sub-icon_align-side elementor-widget-width-auto elementor-widget elementor-widget-the7_horizontal-menu" data-id="${id}" data-element_type="widget" data-widget_type="the7_horizontal-menu.default">
    <div class="elementor-widget-container">
      ${innerHTML}
    </div>
  </div>`;
}

/**
 * Generate Search Widget HTML (Header)
 */
export function generateSearchWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const style = widget.style || "icon";
  const placeholder = widget.placeholder || "Search...";

  const innerHTML = style === "icon"
    ? `<div class="elementor-search-icon-wrapper">
        <button class="elementor-search-icon" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>`
    : `<div class="elementor-search-form-wrapper">
        <form class="elementor-search-form" role="search">
          <input type="search" placeholder="${placeholder}" class="elementor-search-input" />
          <button type="submit" class="elementor-search-submit" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </form>
      </div>`;

  return generateWidgetWrapper("search", id, widget.settings, innerHTML);
}

/**
 * Generate Cart Icon Widget HTML (Header)
 */
export function generateCartIconWidget(widget: any): string {
  const id = widget.id || generateElementorId();
  const itemCount = widget.itemCount || 0;

  const innerHTML = `<div class="elementor-cart-icon-wrapper">
    <a href="#" class="elementor-cart-icon-link">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      ${itemCount > 0 ? `<span class="elementor-cart-count">${itemCount}</span>` : ''}
    </a>
  </div>`;

  return generateWidgetWrapper("cart-icon", id, widget.settings, innerHTML);
}

/**
 * Generate Global Header HTML - PROFESSIONAL ELEMENTOR PATTERN
 * Matches the exact structure and classes used in professional Elementor themes
 */
export function generateGlobalHeaderHTML(headerConfig: any, colors?: any): string {
  const id = headerConfig.id || Math.floor(Math.random() * 10000);
  const elementId = `element-${generateElementorId()}`;
  const layout = headerConfig.layout || "standard";
  const height = headerConfig.height || 80;
  const backgroundColor = headerConfig.backgroundColor || colors?.colors?.[0] || "#ffffff";
  const sticky = headerConfig.sticky !== false;
  const widgets = headerConfig.widgets || [];

  // Separate widgets by position for proper layout
  const logoWidget = widgets.find((w: any) => w.type === "site-logo");
  const navWidget = widgets.find((w: any) => w.type === "nav-menu");
  const rightWidgets = widgets.filter((w: any) =>
    w.type !== "site-logo" && w.type !== "nav-menu"
  );

  // Generate widget HTML
  const logoHTML = logoWidget ? generateSiteLogoWidget(logoWidget) : '';
  const navHTML = navWidget ? generateNavMenuWidget(navWidget) : '';
  const rightWidgetsHTML = rightWidgets.map((widget: any) => {
    switch (widget.type) {
      case "search":
        return generateSearchWidget(widget);
      case "icon-box":
        return generateIconBoxWidget(widget);
      case "button":
        return generateButtonWidget(widget);
      case "cart-icon":
        return generateCartIconWidget(widget);
      default:
        return `<!-- Unknown widget: ${widget.type} -->`;
    }
  }).join('\n        ');

  // Build header with professional Elementor structure
  return `<!-- Global Header - Professional Elementor Pattern -->
<header data-elementor-type="header" data-elementor-id="${id}" class="elementor elementor-${id} elementor-location-header" data-elementor-post-type="elementor_library">
  <div class="elementor-element ${elementId} ${sticky ? 'the7-e-sticky-row-yes the7-e-sticky-effect-yes the7-e-sticky-overlap-yes the7-e-sticky-scrollup-yes' : ''} e-flex e-con-boxed e-con e-parent" data-id="${elementId}" data-element_type="container" ${sticky ? `data-settings='{"the7_sticky_row":"yes","the7_sticky_effects":"yes","the7_sticky_row_devices":["desktop","tablet","mobile"]}'` : ''} style="background-color: ${backgroundColor};">
    <div class="e-con-inner" style="min-height: ${height}px; display: flex; align-items: center; justify-content: space-between; padding: 0 var(--spacing-lg);">
      ${logoHTML}

      <div class="elementor-element elementor-element-nav-${generateElementorId()} e-con-full e-flex e-con e-child" data-element_type="container">
        ${navHTML}
      </div>

      <div class="elementor-element elementor-element-actions-${generateElementorId()} e-con-full e-flex e-con e-child" data-element_type="container" style="display: flex; align-items: center; gap: var(--spacing-md);">
        ${rightWidgetsHTML}
      </div>
    </div>
  </div>
</header>`;
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
    case "image-gallery":
    case "gallery":
      return generateImageGalleryWidget(widget, mediaAssets);
    case "image-carousel":
    case "carousel":
      return generateImageCarouselWidget(widget, mediaAssets);
    case "icon-list":
      return generateIconListWidget(widget);
    case "toggle":
      return generateToggleWidget(widget);
    case "html":
      return generateHTMLWidget(widget);
    case "audio":
      return generateAudioWidget(widget);
    case "form":
      return generateFormWidget(widget);
    case "price-table":
      return generatePriceTableWidget(widget);
    case "flip-box":
      return generateFlipBoxWidget(widget);
    case "countdown":
      return generateCountdownWidget(widget);
    case "animated-headline":
      return generateAnimatedHeadlineWidget(widget);
    case "site-logo":
      return generateSiteLogoWidget(widget);
    case "nav-menu":
      return generateNavMenuWidget(widget);
    case "search":
      return generateSearchWidget(widget);
    case "cart-icon":
      return generateCartIconWidget(widget);
    default:
      // Fallback for unsupported widgets - return placeholder comment
      return `<!-- Elementor widget type "${widget.type}" not yet implemented -->`;
  }
}
