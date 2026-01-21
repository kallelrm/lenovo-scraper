import { Request, Response } from "express";
import { WebScraperScraper } from "../../infrastructure/scrapers/webscraper.scraper";

export class NotebookController {
  private scraper = new WebScraperScraper();

  async getNotebooks(req: Request, res: Response) {
    try {
      const notebooks = await this.scraper.scrapeNotebooks();
      res.json(notebooks);
    } catch {
      res.status(500).json({ error: "Failed to scrape notebooks" });
    }
  }
}