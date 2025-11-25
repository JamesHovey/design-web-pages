import { scrapeWithHttp } from "./httpScraper";
import { scrapeWebsite as scrapeWithPuppeteer, ScrapedData } from "./puppeteerService";

export interface ScrapeResult {
  success: boolean;
  data?: ScrapedData;
  method?: 'http' | 'puppeteer';
  error?: string;
  needsManualUpload?: boolean;
}

/**
 * Hybrid scraping approach:
 * 1. Try lightweight HTTP scraping first (fast, rarely blocked)
 * 2. Fall back to Puppeteer if HTTP fails or content is insufficient
 * 3. If both fail with 403, suggest manual screenshot upload
 */
export async function scrapeWebsiteHybrid(url: string): Promise<ScrapeResult> {
  console.log(`[Hybrid Scraper] Starting scrape for: ${url}`);

  // TIER 1: Try HTTP scraping first
  try {
    console.log('[Hybrid Scraper] Attempting HTTP scraping (Tier 1)...');
    const httpData = await scrapeWithHttp(url);

    console.log('[Hybrid Scraper] ✓ HTTP scraping succeeded!');
    return {
      success: true,
      data: httpData,
      method: 'http',
    };
  } catch (httpError) {
    const errorMessage = httpError instanceof Error ? httpError.message : String(httpError);
    console.log(`[Hybrid Scraper] ✗ HTTP scraping failed: ${errorMessage}`);

    // Check if it's a 403 block
    if (errorMessage.includes('HTTP_BLOCKED_403')) {
      console.log('[Hybrid Scraper] Detected 403 block on HTTP, trying Puppeteer with stealth...');
      // Fall through to Puppeteer attempt
    } else if (errorMessage.includes('NEEDS_JAVASCRIPT')) {
      console.log('[Hybrid Scraper] Site needs JavaScript rendering, trying Puppeteer...');
      // Fall through to Puppeteer attempt
    } else {
      // Other HTTP errors, still try Puppeteer as fallback
      console.log('[Hybrid Scraper] HTTP error, attempting Puppeteer fallback...');
    }
  }

  // TIER 2: Try Puppeteer with stealth
  try {
    console.log('[Hybrid Scraper] Attempting Puppeteer scraping (Tier 2)...');
    const puppeteerData = await scrapeWithPuppeteer(url);

    console.log('[Hybrid Scraper] ✓ Puppeteer scraping succeeded!');
    return {
      success: true,
      data: puppeteerData,
      method: 'puppeteer',
    };
  } catch (puppeteerError) {
    const errorMessage = puppeteerError instanceof Error ? puppeteerError.message : String(puppeteerError);
    console.error(`[Hybrid Scraper] ✗ Puppeteer scraping failed: ${errorMessage}`);

    // Check if it's a 403 block
    if (errorMessage.includes('403') || errorMessage.includes('Access denied')) {
      console.log('[Hybrid Scraper] Both HTTP and Puppeteer blocked. Manual upload recommended.');
      return {
        success: false,
        error: errorMessage,
        needsManualUpload: true,
      };
    }

    // Other errors
    return {
      success: false,
      error: errorMessage,
      needsManualUpload: false,
    };
  }
}
