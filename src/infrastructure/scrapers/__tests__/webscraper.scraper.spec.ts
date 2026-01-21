const mockGet = jest.fn();

jest.mock("../../http/axios.client", () => {
  return {
    AxiosHttpClient: jest.fn().mockImplementation(() => ({
      get: mockGet,
    })),
  };
});

import { WebScraperScraper } from "../webscraper.scraper";

describe("WebScraperScraper", () => {
  beforeEach(() => {
    mockGet.mockReset();
    process.env.SCRAPING_URL = "http://example.com/products";
  });

  test("scrapes multiple pages, parses specs, filters Lenovo and sorts by price", async () => {
    const page1Html = `
      <html>
        <body>
          <div class="products">
            <div class="product-wrapper">
              <a class="title" href="/p/1"></a>
              <div class="description">Lenovo IdeaPad, 15.6 inch, Intel Core i5, 8GB RAM, 256GB SSD, Windows 10</div>
              <div class="price">$200</div>
              <div class="ratings"><p></p><p data-rating="4.5"></p></div>
              <div class="review-count"><span>10</span></div>
            </div>
          </div>
          <ul class="pagination">
            <li class="page-item">1</li>
            <li class="page-item">2</li>
            <li class="page-item">3</li>
            <li class="page-item">4</li>
            <li class="page-item">5</li>
            <li class="page-item">6</li>
            <li class="page-item">7</li>
            <li class="page-item">8</li>
            <li class="page-item">9</li>
            <li class="page-item">10</li>
            <li class="page-item">11</li>
            <li class="page-item">12</li>
            <li class="page-item">13</li>
            <li class="page-item"><a>2</a></li>
          </ul>
        </body>
      </html>
    `;

    const page2Html = `
      <html>
        <body>
          <div class="product-wrapper">
            <a class="title" href="/p/2"></a>
            <div class="description">Lenovo Slim, 14 inch, AMD Ryzen 5, 16GB RAM, 512GB SSD, Windows 11</div>
            <div class="price">$150</div>
            <div class="ratings"><p></p><p data-rating="4.7"></p></div>
            <div class="review-count"><span>5</span></div>
          </div>
        </body>
      </html>
    `;

    mockGet.mockImplementation((url: string) => {
      if (url.includes("?page=1")) return Promise.resolve(page1Html);
      if (url.includes("?page=2")) return Promise.resolve(page2Html);
      return Promise.resolve("");
    });

    const scraper = new WebScraperScraper();
    const results = await scraper.scrapeNotebooks();

    // Expect two Lenovo notebooks, sorted by price ascending (150, 200)
    expect(results).toHaveLength(2);
    expect(results[0].price).toBe(150);
    expect(results[1].price).toBe(200);

    // Check parsed specs for first item (from page2)
    expect(results[0].specs.storage).toMatch(/SSD/i);
    expect(results[0].specs.memory).toMatch(/16GB/i);
    expect(results[0].specs.processor).toMatch(/Ryzen/i);
    expect(results[0].specs.screenSize).toMatch(/14 inch|14"/i);
  });
});
