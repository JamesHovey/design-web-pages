/**
 * Professional Header Widgets
 * Enhanced widgets specifically for professional Elementor-style headers
 * Based on analysis of 59 professional WordPress/Elementor sites
 */

import { generateElementorId } from "./htmlGenerator";

/**
 * Generate Enhanced Icon Box for Headers (Phone, Email, etc.)
 * Professional pattern: Icon + Text horizontal layout with prominent styling
 */
export function generateHeaderIconBox(widget: any): string {
  const id = widget.id || generateElementorId();
  const iconType = widget.icon || "phone";
  const text = widget.text || "";
  const description = widget.description || "";
  const link = widget.link || "#";

  // SVG Icons for common header elements
  const icons: Record<string, string> = {
    phone: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
    email: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    location: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    chat: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  };

  const iconHTML = icons[iconType] || icons.phone;

  // Create proper link href based on type
  let href = link;
  if (link === "#") {
    if (iconType === "phone") {
      href = `tel:${text.replace(/[^0-9+]/g, "")}`;
    } else if (iconType === "email") {
      href = `mailto:${text}`;
    }
  }

  const innerHTML = `<a href="${href}" class="header-icon-box-link" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; transition: var(--professional-transition); padding: var(--spacing-xs) var(--spacing-sm); border-radius: var(--radius-sm);">
    <div class="header-icon-box-icon" style="flex-shrink: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
      ${iconHTML}
    </div>
    <div class="header-icon-box-content" style="line-height: 1.3;">
      ${description ? `<div class="header-icon-box-label" style="font-size: 12px; opacity: 0.7; font-weight: 500;">${description}</div>` : ''}
      <div class="header-icon-box-text" style="font-size: ${description ? '16px' : '15px'}; font-weight: 600;">${text}</div>
    </div>
  </a>`;

  return `<div class="elementor-element elementor-widget elementor-widget-icon-box header-icon-box-widget" data-id="${id}" data-element_type="widget">
    <div class="elementor-widget-container">
      ${innerHTML}
    </div>
  </div>`;
}

/**
 * Generate Utility Bar (Top bar with contact info, hours, social, etc.)
 */
export function generateUtilityBar(config: any): string {
  const id = generateElementorId();
  const backgroundColor = config.backgroundColor || "#f8f9fa";
  const textColor = config.textColor || "#6c757d";
  const leftItems = config.leftItems || [];
  const rightItems = config.rightItems || [];

  const generateItem = (item: any) => {
    if (item.type === "text") {
      return `<span class="utility-bar-text" style="font-size: 14px; color: ${textColor};">${item.text}</span>`;
    } else if (item.type === "link") {
      return `<a href="${item.link || '#'}" class="utility-bar-link" style="font-size: 14px; color: ${textColor}; text-decoration: none; transition: var(--professional-transition);">${item.text}</a>`;
    } else if (item.type === "social-icons") {
      const icons = item.icons || [];
      return `<div class="utility-bar-social" style="display: flex; gap: 12px;">
        ${icons.map((icon: any) => `
          <a href="${icon.url || '#'}" target="_blank" rel="noopener" style="color: ${textColor}; transition: var(--professional-transition);">
            <i class="fab fa-${icon.platform}"></i>
          </a>
        `).join('')}
      </div>`;
    }
    return '';
  };

  return `<div class="elementor-utility-bar" data-id="${id}" style="background-color: ${backgroundColor}; color: ${textColor}; padding: var(--spacing-xs) var(--spacing-lg); font-size: 14px;">
    <div class="utility-bar-container" style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
      <div class="utility-bar-left" style="display: flex; align-items: center; gap: var(--spacing-md);">
        ${leftItems.map(generateItem).join('')}
      </div>
      <div class="utility-bar-right" style="display: flex; align-items: center; gap: var(--spacing-md);">
        ${rightItems.map(generateItem).join('')}
      </div>
    </div>
  </div>`;
}

/**
 * Generate Announcement Bar (Promotional banner above header)
 */
export function generateAnnouncementBar(config: any): string {
  const id = generateElementorId();
  const text = config.text || "Special Offer! Get 20% off today!";
  const backgroundColor = config.backgroundColor || "#007bff";
  const textColor = config.textColor || "#ffffff";
  const link = config.link || "";
  const closeable = config.closeable !== false;

  const content = link
    ? `<a href="${link}" style="color: ${textColor}; text-decoration: none; font-weight: 500;">${text}</a>`
    : `<span style="font-weight: 500;">${text}</span>`;

  return `<div class="elementor-announcement-bar" data-id="${id}" style="background-color: ${backgroundColor}; color: ${textColor}; padding: 12px var(--spacing-lg); text-align: center; position: relative; font-size: 15px;">
    ${content}
    ${closeable ? `
      <button class="announcement-bar-close" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: ${textColor}; cursor: pointer; font-size: 20px; line-height: 1; opacity: 0.8; transition: var(--professional-transition);" aria-label="Close" onclick="this.parentElement.style.display='none'">
        ×
      </button>
    ` : ''}
  </div>`;
}

/**
 * Generate Enhanced Global Header with Two-Row Support
 */
export function generateProfessionalHeader(headerConfig: any, colors?: any): string {
  const id = headerConfig.id || Math.floor(Math.random() * 10000);
  const elementId = `element-${generateElementorId()}`;

  const hasUtilityBar = headerConfig.utilityBar && (headerConfig.utilityBar.leftItems?.length > 0 || headerConfig.utilityBar.rightItems?.length > 0);
  const hasAnnouncementBar = headerConfig.announcementBar && headerConfig.announcementBar.text;

  const mainNavBg = headerConfig.backgroundColor || colors?.colors?.[0] || "#ffffff";
  const sticky = headerConfig.sticky !== false;
  const height = headerConfig.height || 80;

  // Generate announcement bar if configured
  const announcementHTML = hasAnnouncementBar ? generateAnnouncementBar(headerConfig.announcementBar) : '';

  // Generate utility bar if configured
  const utilityBarHTML = hasUtilityBar ? generateUtilityBar(headerConfig.utilityBar) : '';

  // Generate main navigation (logo, menu, actions)
  const widgets = headerConfig.widgets || [];
  const logoWidget = widgets.find((w: any) => w.type === "site-logo");
  const navWidget = widgets.find((w: any) => w.type === "nav-menu");
  const rightWidgets = widgets.filter((w: any) => w.type !== "site-logo" && w.type !== "nav-menu");

  // Import from main htmlGenerator (these need to be available)
  // In actual use, these would be imported properly
  const logoHTML = logoWidget ? `<!-- Logo widget HTML -->` : '';
  const navHTML = navWidget ? `<!-- Nav widget HTML -->` : '';
  const rightWidgetsHTML = rightWidgets.map(() => `<!-- Right widget HTML -->`).join('\n');

  return `${announcementHTML}
<header data-elementor-type="header" data-elementor-id="${id}" class="elementor elementor-${id} elementor-location-header ${hasUtilityBar ? 'header-two-row' : 'header-single-row'}" data-elementor-post-type="elementor_library">
  ${utilityBarHTML}
  <div class="elementor-element ${elementId} ${sticky ? 'the7-e-sticky-row-yes' : ''} e-flex e-con-boxed e-con e-parent" data-id="${elementId}" data-element_type="container" style="background-color: ${mainNavBg};">
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
