import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapedData } from "./puppeteerService";

/**
 * Lightweight HTTP scraper - tries to scrape without browser automation
 * Much faster and less likely to be blocked than Puppeteer
 */
export async function scrapeWithHttp(url: string): Promise<ScrapedData> {
  try {
    // Fetch the HTML with realistic headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
      timeout: 30000,
      maxRedirects: 5,
    });

    // Check for blocking
    if (response.status === 403) {
      throw new Error('HTTP_BLOCKED_403');
    }

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract title
    const title = $('title').text().trim() || $('h1').first().text().trim() || '';

    // Extract main content
    const content = $('body').text().replace(/\s+/g, ' ').trim();

    // Extract header
    const header = $('header').text().replace(/\s+/g, ' ').trim() || '';

    // Extract navigation
    const navigation: string[] = [];
    $('nav a, header a').each((_, el) => {
      const text = $(el).text().trim();
      if (text) navigation.push(text);
    });

    // Extract sections
    const sections: string[] = [];
    $('section, main > div').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text && text.length > 20) sections.push(text);
    });

    // Extract footer
    const footer = $('footer').text().replace(/\s+/g, ' ').trim() || '';

    // Extract images
    const images: Array<{ src: string; alt: string }> = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt') || '';
      if (src) {
        // Convert relative URLs to absolute
        const absoluteSrc = src.startsWith('http') ? src : new URL(src, url).href;
        images.push({ src: absoluteSrc, alt });
      }
    });

    // Extract forms
    const forms: Array<{ action: string; fields: string[] }> = [];
    $('form').each((_, el) => {
      const action = $(el).attr('action') || '';
      const fields: string[] = [];
      $(el).find('input, textarea, select').each((_, field) => {
        const name = $(field).attr('name') || $(field).attr('type') || '';
        if (name) fields.push(name);
      });
      forms.push({ action, fields });
    });

    // Extract buttons and CTAs
    const buttons: Array<{ text: string; href?: string }> = [];
    $('button, a.button, a.btn, input[type="submit"], .cta').each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href') || '';
      if (text) buttons.push({ text, href });
    });

    // Try to find logo
    let logo: { src: string; alt: string } | undefined;
    const logoSelectors = [
      'header img[alt*="logo" i]',
      'header img:first-of-type',
      '.logo img',
      '#logo img',
      'a[href="/"] img',
    ];
    for (const selector of logoSelectors) {
      const logoEl = $(selector).first();
      if (logoEl.length) {
        const src = logoEl.attr('src');
        const alt = logoEl.attr('alt') || '';
        if (src) {
          const absoluteSrc = src.startsWith('http') ? src : new URL(src, url).href;
          logo = { src: absoluteSrc, alt };
          break;
        }
      }
    }

    // Check if content seems too minimal (might need JavaScript)
    const contentLength = content.length;
    const hasEnoughContent = contentLength > 500;
    const hasStructure = sections.length > 0 || navigation.length > 0;

    if (!hasEnoughContent || !hasStructure) {
      throw new Error('NEEDS_JAVASCRIPT');
    }

    return {
      url,
      title,
      content,
      structure: {
        header,
        navigation,
        sections,
        footer,
      },
      images,
      forms,
      buttons,
      logo,
    };
  } catch (error) {
    // Re-throw with context
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('HTTP_BLOCKED_403');
      } else if (error.response?.status === 429) {
        throw new Error('HTTP_RATE_LIMITED_429');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('HTTP_DNS_ERROR');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('HTTP_TIMEOUT');
      }
    }
    throw error;
  }
}

/**
 * Detect if a site is JavaScript-heavy by checking meta tags and scripts
 */
export function isJavaScriptHeavySite(html: string): boolean {
  const $ = cheerio.load(html);

  // Check for SPA frameworks
  const hasReact = html.includes('react') || html.includes('React');
  const hasVue = html.includes('vue') || html.includes('Vue');
  const hasAngular = html.includes('angular') || html.includes('ng-app');
  const hasNext = $('script[src*="next"]').length > 0;

  return hasReact || hasVue || hasAngular || hasNext;
}
