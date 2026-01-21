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

  describe("scrapeNotebooks", () => {
    test("should scrape multiple pages, parse specs, filter Lenovo products and sort by price", async () => {
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
              <li class="page-item"><a>1</a></li>
              <li class="page-item"><a>2</a></li>
              <li class="page-item"><a>3</a></li>
              <li class="page-item"><a>4</a></li>
              <li class="page-item"><a>5</a></li>
              <li class="page-item"><a>6</a></li>
              <li class="page-item"><a>7</a></li>
              <li class="page-item"><a>8</a></li>
              <li class="page-item"><a>9</a></li>
              <li class="page-item"><a>10</a></li>
              <li class="page-item"><a>11</a></li>
              <li class="page-item"><a>12</a></li>
              <li class="page-item"><a>13</a></li>
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
            <ul class="pagination">
              <li class="page-item"><a>1</a></li>
              <li class="page-item"><a>2</a></li>
              <li class="page-item"><a>3</a></li>
              <li class="page-item"><a>4</a></li>
              <li class="page-item"><a>5</a></li>
              <li class="page-item"><a>6</a></li>
              <li class="page-item"><a>7</a></li>
              <li class="page-item"><a>8</a></li>
              <li class="page-item"><a>9</a></li>
              <li class="page-item"><a>10</a></li>
              <li class="page-item"><a>11</a></li>
              <li class="page-item"><a>12</a></li>
              <li class="page-item"><a>13</a></li>
              <li class="page-item"><a>2</a></li>
            </ul>
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

      expect(results).toHaveLength(2);
      expect(results[0].price).toBe(150);
      expect(results[0].title).toBe("Lenovo Slim");
      expect(results[1].price).toBe(200);
      expect(results[1].title).toBe("Lenovo IdeaPad");
    });

    test("should correctly parse product specifications from description", async () => {
      const pageHtml = `
        <html>
          <body>
            <div class="product-wrapper">
              <a class="title" href="/p/1"></a>
              <div class="description">Lenovo ThinkPad, 15.6 inch, Intel Core i7, 32GB RAM, 1TB SSD, Windows 11</div>
              <div class="price">$999</div>
              <div class="ratings"><p></p><p data-rating="4.8"></p></div>
              <div class="review-count"><span>25</span></div>
            </div>
            <ul class="pagination">
              <li class="page-item"><a>1</a></li>
              <li class="page-item"><a>2</a></li>
              <li class="page-item"><a>3</a></li>
              <li class="page-item"><a>4</a></li>
              <li class="page-item"><a>5</a></li>
              <li class="page-item"><a>6</a></li>
              <li class="page-item"><a>7</a></li>
              <li class="page-item"><a>8</a></li>
              <li class="page-item"><a>9</a></li>
              <li class="page-item"><a>10</a></li>
              <li class="page-item"><a>11</a></li>
              <li class="page-item"><a>12</a></li>
              <li class="page-item"><a>13</a></li>
              <li class="page-item"><a>1</a></li>
            </ul>
          </body>
        </html>
      `;

      mockGet.mockResolvedValue(pageHtml);

      const scraper = new WebScraperScraper();
      const results = await scraper.scrapeNotebooks();

      expect(results).toHaveLength(1);
      expect(results[0].specs.screenSize).toMatch(/15.6 inch/);
      expect(results[0].specs.processor).toMatch(/Core i7/);
      expect(results[0].specs.memory).toMatch(/32GB/);
      expect(results[0].specs.storage).toMatch(/1TB/);
      expect(results[0].specs.os).toMatch(/Windows 11/);
    });

    test("should filter out non-Lenovo products", async () => {
      const pageHtml = `
        <html>
          <body>
            <div class="product-wrapper">
              <a class="title" href="/p/1"></a>
              <div class="description">Lenovo IdeaPad, 15.6 inch, Intel Core i5, 8GB RAM, 256GB SSD, Windows 10</div>
              <div class="price">$500</div>
              <div class="ratings"><p></p><p data-rating="4.5"></p></div>
              <div class="review-count"><span>10</span></div>
            </div>
            <div class="product-wrapper">
              <a class="title" href="/p/2"></a>
              <div class="description">Dell XPS, 14 inch, Intel Core i7, 16GB RAM, 512GB SSD, Windows 11</div>
              <div class="price">$800</div>
              <div class="ratings"><p></p><p data-rating="4.6"></p></div>
              <div class="review-count"><span>20</span></div>
            </div>
            <ul class="pagination">
              <li class="page-item"><a>1</a></li>
              <li class="page-item"><a>2</a></li>
              <li class="page-item"><a>3</a></li>
              <li class="page-item"><a>4</a></li>
              <li class="page-item"><a>5</a></li>
              <li class="page-item"><a>6</a></li>
              <li class="page-item"><a>7</a></li>
              <li class="page-item"><a>8</a></li>
              <li class="page-item"><a>9</a></li>
              <li class="page-item"><a>10</a></li>
              <li class="page-item"><a>11</a></li>
              <li class="page-item"><a>12</a></li>
              <li class="page-item"><a>13</a></li>
              <li class="page-item"><a>1</a></li>
            </ul>
          </body>
        </html>
      `;

      mockGet.mockResolvedValue(pageHtml);

      const scraper = new WebScraperScraper();
      const results = await scraper.scrapeNotebooks();

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("Lenovo IdeaPad");
    });

    test("should sort products by price in ascending order", async () => {
      const pageHtml = `
        <html>
          <body>
            <div class="product-wrapper">
              <a class="title" href="/p/1"></a>
              <div class="description">Lenovo Model C, 15.6 inch, Intel Core i5, 8GB RAM, 256GB SSD, Windows 10</div>
              <div class="price">$600</div>
              <div class="ratings"><p></p><p data-rating="4.0"></p></div>
              <div class="review-count"><span>5</span></div>
            </div>
            <div class="product-wrapper">
              <a class="title" href="/p/2"></a>
              <div class="description">Lenovo Model A, 14 inch, Intel Core i5, 8GB RAM, 256GB SSD, Windows 10</div>
              <div class="price">$300</div>
              <div class="ratings"><p></p><p data-rating="4.2"></p></div>
              <div class="review-count"><span>15</span></div>
            </div>
            <div class="product-wrapper">
              <a class="title" href="/p/3"></a>
              <div class="description">Lenovo Model B, 15.6 inch, Intel Core i5, 8GB RAM, 256GB SSD, Windows 10</div>
              <div class="price">$450</div>
              <div class="ratings"><p></p><p data-rating="4.3"></p></div>
              <div class="review-count"><span>10</span></div>
            </div>
            <ul class="pagination">
              <li class="page-item"><a>1</a></li>
              <li class="page-item"><a>2</a></li>
              <li class="page-item"><a>3</a></li>
              <li class="page-item"><a>4</a></li>
              <li class="page-item"><a>5</a></li>
              <li class="page-item"><a>6</a></li>
              <li class="page-item"><a>7</a></li>
              <li class="page-item"><a>8</a></li>
              <li class="page-item"><a>9</a></li>
              <li class="page-item"><a>10</a></li>
              <li class="page-item"><a>11</a></li>
              <li class="page-item"><a>12</a></li>
              <li class="page-item"><a>13</a></li>
              <li class="page-item"><a>1</a></li>
            </ul>
          </body>
        </html>
      `;

      mockGet.mockResolvedValue(pageHtml);

      const scraper = new WebScraperScraper();
      const results = await scraper.scrapeNotebooks();

      expect(results).toHaveLength(3);
      expect(results[0].price).toBe(300);
      expect(results[1].price).toBe(450);
    });

    test("should handle missing or invalid price gracefully", async () => {
      const pageHtml = `
        <html>
          <body>
            <div class="product-wrapper">
              <a class="title" href="/p/1"></a>
              <div class="description">Lenovo Model A, 15.6 inch, Intel Core i5, 8GB RAM, 256GB SSD, Windows 10</div>
              <div class="price">$400</div>
              <div class="ratings"><p></p><p data-rating="4.0"></p></div>
              <div class="review-count"><span>5</span></div>
            </div>
            <div class="product-wrapper">
              <a class="title" href="/p/2"></a>
              <div class="description">Lenovo Model B, 14 inch, Intel Core i7, 16GB RAM, 512GB SSD, Windows 11</div>
              <div class="price">Invalid</div>
              <div class="ratings"><p></p><p data-rating="4.5"></p></div>
              <div class="review-count"><span>10</span></div>
            </div>
            <ul class="pagination">
              <li class="page-item"><a>1</a></li>
              <li class="page-item"><a>2</a></li>
              <li class="page-item"><a>3</a></li>
              <li class="page-item"><a>4</a></li>
              <li class="page-item"><a>5</a></li>
              <li class="page-item"><a>6</a></li>
              <li class="page-item"><a>7</a></li>
              <li class="page-item"><a>8</a></li>
              <li class="page-item"><a>9</a></li>
              <li class="page-item"><a>10</a></li>
              <li class="page-item"><a>11</a></li>
              <li class="page-item"><a>12</a></li>
              <li class="page-item"><a>13</a></li>
              <li class="page-item"><a>1</a></li>
            </ul>
          </body>
        </html>
      `;

      mockGet.mockResolvedValue(pageHtml);

      const scraper = new WebScraperScraper();
      const results = await scraper.scrapeNotebooks();

      expect(results).toHaveLength(2);
      expect(results[0].price).toBe(0);
      expect(results[1].price).toBe(400);
    });

    test("should capture product ratings and review counts", async () => {
      const pageHtml = `
        <html>
          <body>
            <div class="product-wrapper">
              <a class="title" href="/p/1"></a>
              <div class="description">Lenovo IdeaPad, 15.6 inch, Intel Core i5, 8GB RAM, 256GB SSD, Windows 10</div>
              <div class="price">$500</div>
              <div class="ratings"><p></p><p data-rating="4.7"></p></div>
              <div class="review-count"><span>42</span></div>
            </div>
            <ul class="pagination">
              <li class="page-item"><a>1</a></li>
              <li class="page-item"><a>2</a></li>
              <li class="page-item"><a>3</a></li>
              <li class="page-item"><a>4</a></li>
              <li class="page-item"><a>5</a></li>
              <li class="page-item"><a>6</a></li>
              <li class="page-item"><a>7</a></li>
              <li class="page-item"><a>8</a></li>
              <li class="page-item"><a>9</a></li>
              <li class="page-item"><a>10</a></li>
              <li class="page-item"><a>11</a></li>
              <li class="page-item"><a>12</a></li>
              <li class="page-item"><a>13</a></li>
              <li class="page-item"><a>1</a></li>
            </ul>
          </body>
        </html>
      `;

      mockGet.mockResolvedValue(pageHtml);

      const scraper = new WebScraperScraper();
      const results = await scraper.scrapeNotebooks();

      expect(results).toHaveLength(1);
      expect(results[0].rating).toBe(4.7);
      expect(results[0].reviewCount).toBe(42);
    });

    test("should handle empty pages gracefully", async () => {
      const emptyPageHtml = `
        <html>
          <body>
            <div class="products"></div>
            <ul class="pagination">
              <li class="page-item"><a>1</a></li>
              <li class="page-item"><a>2</a></li>
              <li class="page-item"><a>3</a></li>
              <li class="page-item"><a>4</a></li>
              <li class="page-item"><a>5</a></li>
              <li class="page-item"><a>6</a></li>
              <li class="page-item"><a>7</a></li>
              <li class="page-item"><a>8</a></li>
              <li class="page-item"><a>9</a></li>
              <li class="page-item"><a>10</a></li>
              <li class="page-item"><a>11</a></li>
              <li class="page-item"><a>12</a></li>
              <li class="page-item"><a>13</a></li>
              <li class="page-item"><a>2</a></li>
            </ul>
          </body>
        </html>
      `;

      const pageWithProductHtml = `
        <html>
          <body>
            <div class="product-wrapper">
              <a class="title" href="/p/1"></a>
              <div class="description">Lenovo IdeaPad, 15.6 inch, Intel Core i5, 8GB RAM, 256GB SSD, Windows 10</div>
              <div class="price">$500</div>
              <div class="ratings"><p></p><p data-rating="4.5"></p></div>
              <div class="review-count"><span>10</span></div>
            </div>
            <ul class="pagination">
              <li class="page-item"><a>1</a></li>
              <li class="page-item"><a>2</a></li>
              <li class="page-item"><a>3</a></li>
              <li class="page-item"><a>4</a></li>
              <li class="page-item"><a>5</a></li>
              <li class="page-item"><a>6</a></li>
              <li class="page-item"><a>7</a></li>
              <li class="page-item"><a>8</a></li>
              <li class="page-item"><a>9</a></li>
              <li class="page-item"><a>10</a></li>
              <li class="page-item"><a>11</a></li>
              <li class="page-item"><a>12</a></li>
              <li class="page-item"><a>13</a></li>
              <li class="page-item"><a>2</a></li>
            </ul>
          </body>
        </html>
      `;

      mockGet.mockImplementation((url: string) => {
        if (url.includes("?page=1")) return Promise.resolve(emptyPageHtml);
        if (url.includes("?page=2")) return Promise.resolve(pageWithProductHtml);
        return Promise.resolve("");
      });

      const scraper = new WebScraperScraper();
      const results = await scraper.scrapeNotebooks();

      expect(results).toHaveLength(1);
    });

    test("should throw error when SCRAPING_URL is not set", () => {
      delete process.env.SCRAPING_URL;

      expect(() => new WebScraperScraper()).toThrow("SCRAPING_URL environment variable is required");
    });

    test("should handle HTTP errors gracefully", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network error"));
      
      const pageHtml = `
        <html>
          <body>
            <div class="product-wrapper">
              <a class="title" href="/p/1"></a>
              <div class="description">Lenovo IdeaPad, 15.6 inch, Intel Core i5, 8GB RAM, 256GB SSD, Windows 10</div>
              <div class="price">$500</div>
              <div class="ratings"><p></p><p data-rating="4.5"></p></div>
              <div class="review-count"><span>10</span></div>
            </div>
            <ul class="pagination">
              <li class="page-item"><a>1</a></li>
              <li class="page-item"><a>2</a></li>
              <li class="page-item"><a>3</a></li>
              <li class="page-item"><a>4</a></li>
              <li class="page-item"><a>5</a></li>
              <li class="page-item"><a>6</a></li>
              <li class="page-item"><a>7</a></li>
              <li class="page-item"><a>8</a></li>
              <li class="page-item"><a>9</a></li>
              <li class="page-item"><a>10</a></li>
              <li class="page-item"><a>11</a></li>
              <li class="page-item"><a>12</a></li>
              <li class="page-item"><a>13</a></li>
              <li class="page-item"><a>1</a></li>
            </ul>
          </body>
        </html>
      `;

      mockGet.mockResolvedValueOnce(pageHtml);

      const scraper = new WebScraperScraper();
      const results = await scraper.scrapeNotebooks();

      // Should return products from successful page
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("Lenovo IdeaPad");
    });
  });
});
