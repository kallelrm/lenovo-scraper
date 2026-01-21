import { Request, Response } from "express";
import { WebScraperScraper } from "../../infrastructure/scrapers/webscraper.scraper";
import { Notebook } from "../../domain/entities/notebook.entity";

export class NotebookController {
  private lastScraped : { data: Notebook[]; timestamp: number } | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000;
  private scraper = new WebScraperScraper();

  async getNotebooks(req: Request, res: Response) {
    try {
      if (this.lastScraped && (Date.now() - this.lastScraped.timestamp) < 10 * 60 * 1000) {
        return res.json({
          source: "cache",
          data: this.lastScraped.data});
      }
      const notebooks = await this.scraper.scrapeNotebooks();
      this.lastScraped = { data: notebooks, timestamp: Date.now() };
      res.json({
        source: "scraped",
        data: notebooks
      });
    } catch {
      res.status(500).json({ error: "Failed to scrape notebooks" });
    }
  }
}