import { URL } from 'node:url';

export class SafeWebScraper {
  private static readonly BLOCKED_HOSTS = new Set([
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '169.254.169.254', // AWS/GCP instance metadata IP
  ]);

  /**
   * Validates if a target URL is safe to fetch (Prevents SSRF)
   */
  static isUrlSafe(targetUrl: string): { safe: boolean; reason?: string } {
    try {
      const parsed = new URL(targetUrl);

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { safe: false, reason: 'Only HTTP and HTTPS protocols are permitted.' };
      }

      const hostname = parsed.hostname.toLowerCase();

      if (this.BLOCKED_HOSTS.has(hostname)) {
        return { safe: false, reason: 'Access to loopback/metadata addresses is strictly forbidden.' };
      }

      // Check private IP ranges
      if (
        /^10\./.test(hostname) ||
        /^192\.168\./.test(hostname) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
        /^127\./.test(hostname)
      ) {
        return { safe: false, reason: 'Access to private internal network addresses is forbidden.' };
      }

      return { safe: true };
    } catch {
      return { safe: false, reason: 'Malformed URL.' };
    }
  }

  /**
   * Fetches and cleans webpage text content
   */
  static async fetchAndClean(url: string, timeoutMs: number = 8000): Promise<{ title: string; content: string }> {
    const safetyCheck = this.isUrlSafe(url);
    if (!safetyCheck.safe) {
      throw new Error(`SSRF Security Guard blocked request to ${url}: ${safetyCheck.reason}`);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'AIMarketingSaaS-Bot/1.0 (+https://aimarketingsaas.com/bot)',
        Accept: 'text/html,application/xhtml+xml,text/plain',
      },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Web crawler error (${response.status}): ${response.statusText}`);
    }

    const html = await response.text();
    return this.cleanHtml(html);
  }

  /**
   * Strips scripts, styles, navigation and extracts structured text
   */
  static cleanHtml(html: string): { title: string; content: string } {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Website Page';

    let cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ') // Strip remaining HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    return { title, content: cleaned };
  }
}
