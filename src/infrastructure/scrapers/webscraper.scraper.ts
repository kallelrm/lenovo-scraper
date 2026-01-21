import { AxiosHttpClient } from "../http/axios.client";
import { Notebook } from "../../domain/entities/notebook.entity";
import * as cheerio from "cheerio";

export class WebScraperScraper {
  private readonly url = "https://webscraper.io/test-sites/e-commerce/static/computers/laptops";

  async scrapeNotebooks(): Promise<Notebook[]> {
    const httpClient = new AxiosHttpClient();
    const response = await httpClient.get(this.url);
    const html = response;
    const $ = cheerio.load(html);
    const notebooks: Notebook[] = [];

    $(".product-wrapper").each((_, element) => {
      const id = $(element).find(".title").attr("href");
      const title = $(element).find(".title").text().trim();
      const price = Number($(element).find(".price").text().trim().slice(1)) || 0;
      const [screenSize, processor, memory, storage, os] = $(element).find(".description").text().trim().split(",");
      // const [screenSize, , memory, , ] = $(element).find(".description").text().trim().split(",");
      // const test = $(element).find(".description").text().trim().split(",");
      // console.log(test);
      notebooks.push(new Notebook({
        id: id?.trim(),
        title: title?.trim(),
        price: price,
        screenSize: screenSize?.trim(),
        processor: processor?.trim(),
        memory: memory.trim(),
        storage: storage.trim(),
        os
      }));

    });

    return notebooks;
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