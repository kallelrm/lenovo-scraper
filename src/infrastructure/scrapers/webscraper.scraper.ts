import { AxiosHttpClient } from "../http/axios.client";
import { Notebook } from "../../domain/entities/notebook.entity";
import * as cheerio from "cheerio";

export class WebScraperScraper {
  private readonly url: string;
  private httpClient = new AxiosHttpClient();

  constructor() {
    const url = process.env.SCRAPING_URL;
    if (!url) {
      throw new Error("SCRAPING_URL environment variable is required");
    }
    this.url = url;
  }

  async scrapeNotebooks(): Promise<Notebook[]> {
    const totalPages = await this.getTotalPages();  

    const pagePromises: Promise<Notebook[]>[] = [];
    
    for (let page = 1; page <= totalPages; page++) {
      pagePromises.push(this.scrapePage(page));
    }
    const pageResults = await Promise.all(pagePromises);
    const allNotebooks = pageResults.flat();

    return this.filterAndSort(allNotebooks);
  }

  private async getTotalPages(): Promise<number> {
    try {
      const response = await this.httpClient.get(`${this.url}?page=1`);
      const html = response;
    
      const $ = cheerio.load(html);
    
      const totalPages = Number($("li.page-item:nth-child(14) > a:nth-child(1)").text());
      return totalPages;
    } catch(error) {
      console.error("Error fetching total pages:", error);
      return 1;
    }
  }

  private async scrapePage(page: number): Promise<Notebook[]> {
    try {

      const response = await this.httpClient.get(`${this.url}?page=${page}`);
      const html = response;
      const $ = cheerio.load(html);
      const notebooks: Notebook[] = [];
      
      $(".product-wrapper").each((_, element) => {
        const [title, ...description] = $(element).find(".description").text().trim().split(",");
        if (!title.includes("Lenovo")) {
          return;
        }
        const id = $(element).find(".title").attr("href");
        const price = Number($(element).find(".price").text().trim().slice(1)) || 0;
        const rating = Number($(element).find(".ratings p:nth-child(2)").attr("data-rating"));
        const reviewCount = Number($(element).find(".review-count span").text().trim()) || 0;
        const specs = this.parseDescription(description.join(","));
        notebooks.push(new Notebook({
          id: id?.trim(),
          title: title?.trim(),
          price: price,
          description: `${title}, ${description.join(",").trim()}`,
          rating,
          reviewCount,
          specs,
        }));
      });
      return notebooks;
    } catch (error) {
      console.error(`Error scraping page ${page}:`, error);
      return [];
    }
  }

  private parseDescription(description: string) {
    const parts = description
      .split(",")
      .map(part => part.trim())
      .filter(part => part.length > 0);
    
    const isStorage = (s: string) => /(SSD|HDD|Flash|TB)/i.test(s);
    const isMemory = (s: string) => /(\d+)\s*GB/i.test(s) && (s.toUpperCase().includes("RAM") || !isStorage(s));
    
    const storage = parts.find(s => isStorage(s)) || "";

    const memory = parts.find(s => isMemory(s)) || "";

    const screenSize = parts.find(s => /(\d+(\.\d+)?)\s*(inch|")/i.test(s)) || "";
    const processor = parts.find(s => /(Intel|AMD|Core|Ryzen|Celeron|Pentium)/i.test(s)) || "";
    const os = parts.find(s => /(Windows|Linux|Mac|OS)/i.test(s)) || "";

    return {
      screenSize,
      processor,
      storage,
      memory,
      os
    };
  }

  private filterAndSort(notebooks: Notebook[]): Notebook[] {
    return notebooks
      .filter(n => n.title.includes("Lenovo"))
      .sort((a, b) => a.price - b.price);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
