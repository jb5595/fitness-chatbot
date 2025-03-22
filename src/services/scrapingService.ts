import axios from "axios";
import * as cheerio from "cheerio";

export class ScrapingService {
    static readonly NEW_URL_DELIMITER = "----NEW URL PAGE -----";

    static async scrapeUrls(urls: string[]): Promise<string> {
        const scrapedTexts = await Promise.all(
            urls.map(url => this.scrapeUrl(url))
        );
        return scrapedTexts.join(this.NEW_URL_DELIMITER);
    }

    static async scrapeUrl(url: string): Promise<string> {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const text = $("p, h1, h2, h3, h4, h5, h6")
                .map((i, el) => $(el).text().trim())
                .get()
                .join("\n");
            
            return text.length > 0 ? text : "No readable content found.";
        } catch (error) {
            console.error("Scraping error:", error);
            return "Failed to scrape the URL.";
        }
    }
}