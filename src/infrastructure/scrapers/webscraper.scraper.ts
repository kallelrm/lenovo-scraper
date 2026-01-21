import { AxiosHttpClient } from "../http/axios.client";
import { Notebook } from "../../domain/entities/notebook.entity";
import * as cheerio from "cheerio";

export class WebScraperScraper {
  private readonly url = "https://webscraper.io/test-sites/e-commerce/static/computers/laptops";
  private httpClient = new AxiosHttpClient();

  async scrapeNotebooks(): Promise<Notebook[]> {
    const startTime = Date.now();
    
    const totalPages = await this.getTotalPages();  
    console.log(`⏱️  Iniciando scraping de ${totalPages} páginas...`);

    const pagePromises: Promise<Notebook[]>[] = [];
    
    for (let page = 1; page <= totalPages; page++) {
      pagePromises.push(this.scrapePage(page));
    }
    const pageResults = await Promise.all(pagePromises);
    const allNotebooks = pageResults.flat();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`🏁 Concluído em ${duration}s (${allNotebooks.length} notebooks)`);

    return this.filterAndSort(allNotebooks);
  }

  private async getTotalPages(): Promise<number> {
    const response = await this.httpClient.get(`${this.url}?page=1`);
    const html = response;
    const $ = cheerio.load(html);

    const totalPages = Number($("li.page-item:nth-child(14) > a:nth-child(1)").text());
    return totalPages;
  }

  private async scrapePage(page: number): Promise<Notebook[]> {
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
      // const title = $(element).find(".title").text().trim();
      const price = Number($(element).find(".price").text().trim().slice(1)) || 0;
      // const [screenSize, processor, memory, storage, os] = $(element).find(".description").text().trim().split(",");
      notebooks.push(new Notebook({
        id: id?.trim(),
        title: title?.trim(),
        price: price,
        description: `${title}, ${description.join(",").trim()}`,
        // screenSize: screenSize?.trim(),
        // processor: processor?.trim(),
        // memory: memory.trim(),
        // storage: storage.trim(),
        // os
      }));
    });
    return notebooks;
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

// essas funções foram descartadas devido a ter que lidar com muitos edge cases, 
// se possível, retornarei a elas assim que julgar o projeto como pronto
// function checkMemory (mem: string): number {
//   return Number(mem.slice(0, -2)) * 1024;
// }

// function checkStorage (mem: string): number {
//   console.log("input", mem);
//   const index = mem.search(/\D/);
//   console.log("INDICE", index);
//   const [value, multiplier] = [mem.slice(0, index), mem.slice(index)];
//   console.log({value, multiplier});
//   return multiplier === "GB" || multiplier === "GB SSD" ? Number(value) : Number(value) * 1000;
// }