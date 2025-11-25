import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export interface ScrapedData {
  url: string;
  title: string;
  content: string;
  structure: {
    header?: string;
    navigation?: string[];
    sections?: string[];
    footer?: string;
  };
  images: Array<{ src: string; alt: string }>;
  forms: Array<{ action: string; fields: string[] }>;
  buttons: Array<{ text: string; href?: string }>;
  logo?: { src: string; alt: string };
}

/**
 * Scrape a website using Puppeteer with stealth plugin
 */
export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    });

    const page = await browser.newPage();

    // Set realistic viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set multiple headers to appear more like a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    });

    // Override navigator properties to hide automation
    await page.evaluateOnNewDocument(() => {
      // Override the navigator.webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Mock plugins and languages to appear more realistic
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Add chrome property
      (window as any).chrome = {
        runtime: {},
      };

      // Mock permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: 'denied' } as PermissionStatus)
          : originalQuery(parameters);
    });

    // Navigate to the page with error handling
    let response;
    try {
      response = await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000
      });
    } catch (navError) {
      // Try with a more lenient wait condition if networkidle2 fails
      response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000
      });
    }

    // Check if we got blocked (403, 429, etc.)
    if (response) {
      const status = response.status();
      if (status === 403) {
        throw new Error(
          `Access denied (403). The website "${new URL(url).hostname}" is blocking automated access. ` +
          `This is common for sites with anti-bot protection. Try entering the content manually or contact the site owner.`
        );
      } else if (status === 429) {
        throw new Error(
          `Too many requests (429). The website "${new URL(url).hostname}" is rate-limiting our requests. ` +
          `Please try again in a few minutes.`
        );
      } else if (status >= 400) {
        throw new Error(
          `HTTP ${status} error when accessing ${url}. The page may not exist or may be temporarily unavailable.`
        );
      }
    }

    // Wait a bit to let JavaScript and any protection mechanisms settle
    await page.waitForTimeout(2000);

    // Simulate human-like mouse movement
    try {
      await page.mouse.move(100, 100);
      await page.waitForTimeout(100);
      await page.mouse.move(200, 200);
      await page.waitForTimeout(100);
    } catch (mouseError) {
      // Ignore mouse movement errors
      console.log("Mouse simulation failed, continuing...");
    }

    // Extract page data
    const scrapedData = await page.evaluate(() => {
      // Get title
      const title = document.title || "";

      // Get main content
      const content = document.body.innerText || "";

      // Get structure
      const header = document.querySelector("header")?.innerText || "";
      const navigation = Array.from(
        document.querySelectorAll("nav a, header a")
      ).map((a) => (a as HTMLAnchorElement).textContent?.trim() || "");

      const sections = Array.from(document.querySelectorAll("section, main > div")).map(
        (section) => section.textContent?.trim() || ""
      );

      const footer = document.querySelector("footer")?.innerText || "";

      // Get images
      const images = Array.from(document.querySelectorAll("img")).map((img) => ({
        src: img.src,
        alt: img.alt || "",
      }));

      // Get forms
      const forms = Array.from(document.querySelectorAll("form")).map((form) => ({
        action: form.action || "",
        fields: Array.from(form.querySelectorAll("input, textarea, select")).map(
          (field) => (field as HTMLInputElement).name || (field as HTMLInputElement).type
        ),
      }));

      // Get buttons and CTAs
      const buttons = Array.from(
        document.querySelectorAll("button, a.button, a.btn, input[type='submit']")
      ).map((btn) => ({
        text: btn.textContent?.trim() || "",
        href: (btn as HTMLAnchorElement).href || "",
      }));

      // Try to find logo
      const logoSelectors = [
        "header img[alt*='logo' i]",
        "header img:first-of-type",
        ".logo img",
        "#logo img",
        "a[href='/'] img",
      ];
      let logo: { src: string; alt: string } | undefined;
      for (const selector of logoSelectors) {
        const logoEl = document.querySelector(selector) as HTMLImageElement;
        if (logoEl) {
          logo = { src: logoEl.src, alt: logoEl.alt || "" };
          break;
        }
      }

      return {
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
    });

    return {
      url,
      ...scrapedData,
    };
  } catch (error) {
    // Provide more detailed error messages
    if (error instanceof Error) {
      if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
        throw new Error(`Could not resolve domain: ${url}. Please check the URL is correct.`);
      } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        throw new Error(`Connection refused by ${url}. The website may be down.`);
      } else if (error.message.includes('net::ERR_CONNECTION_TIMED_OUT')) {
        throw new Error(`Connection timed out for ${url}. The website may be slow or blocking requests.`);
      } else if (error.message.includes('Timeout')) {
        throw new Error(`Request timed out for ${url}. The website took too long to respond.`);
      }
    }
    // Re-throw original error if no specific handling
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
