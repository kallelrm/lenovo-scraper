import { Notebook } from "../notebook.entity";

describe("Notebook entity", () => {
  describe("constructor", () => {
    test("should construct with provided values", () => {
      const nb = new Notebook({
        id: "123",
        title: "Lenovo IdeaPad",
        price: 599.99,
        description: "A great laptop",
        rating: 4.5,
        reviewCount: 42,
        specs: {
          screenSize: "15.6 inch",
          processor: "Intel Core i5",
          memory: "8GB",
          storage: "256GB SSD",
          os: "Windows 10",
        },
      });

      expect(nb.id).toBe("123");
      expect(nb.title).toBe("Lenovo IdeaPad");
      expect(nb.price).toBe(599.99);
      expect(nb.description).toBe("A great laptop");
      expect(nb.rating).toBe(4.5);
      expect(nb.reviewCount).toBe(42);
      expect(nb.specs).toEqual({
        screenSize: "15.6 inch",
        processor: "Intel Core i5",
        memory: "8GB",
        storage: "256GB SSD",
        os: "Windows 10",
      });
    });

    test("should use default values when properties are not provided", () => {
      const nb = new Notebook({ title: "Lenovo Test" });

      expect(nb.id).toBe("");
      expect(nb.title).toBe("Lenovo Test");
      expect(nb.price).toBe(0);
      expect(nb.description).toBe("");
      expect(nb.rating).toBe(0);
      expect(nb.reviewCount).toBe(0);
      expect(nb.specs).toEqual({});
    });

    test("should use provided values overriding defaults", () => {
      const nb = new Notebook({
        title: "Lenovo ThinkPad",
        price: 1299.99,
        description: "Premium laptop",
        rating: 4.8,
        reviewCount: 100,
      });

      expect(nb.title).toBe("Lenovo ThinkPad");
      expect(nb.price).toBe(1299.99);
      expect(nb.description).toBe("Premium laptop");
      expect(nb.rating).toBe(4.8);
      expect(nb.reviewCount).toBe(100);
      expect(nb.specs).toEqual({});
    });
  });

  describe("validation", () => {
    test("should throw error when title is missing", () => {
      expect(() => new Notebook({} as Partial<ConstructorParameters<typeof Notebook>[0]>)).toThrow("Title is required");
    });

    test("should throw error when title is empty string", () => {
      expect(() => new Notebook({ title: "" })).toThrow("Title is required");
    });

    test("should throw error when title is whitespace only", () => {
      expect(() => new Notebook({ title: "   " })).toThrow("Title is required");
    });

    test("should throw error when title is null", () => {
      expect(() => new Notebook({ title: null as unknown as string })).toThrow("Title is required");
    });

    test("should throw error when title is undefined", () => {
      expect(() => new Notebook({ title: undefined as unknown as string })).toThrow("Title is required");
    });

    test("should accept title with leading/trailing whitespace (doesn't trim on assignment)", () => {
      const nb = new Notebook({ title: "  Lenovo IdeaPad  " });
      expect(nb.title).toBe("  Lenovo IdeaPad  ");
    });
  });

  describe("properties", () => {
    test("should allow price to be zero", () => {
      const nb = new Notebook({ title: "Free Laptop", price: 0 });
      expect(nb.price).toBe(0);
    });

    test("should allow price to be decimal", () => {
      const nb = new Notebook({ title: "Expensive", price: 1999.99 });
      expect(nb.price).toBe(1999.99);
    });

    test("should allow rating to be zero", () => {
      const nb = new Notebook({ title: "Test", rating: 0 });
      expect(nb.rating).toBe(0);
    });

    test("should allow rating to be float", () => {
      const nb = new Notebook({ title: "Test", rating: 4.5 });
      expect(nb.rating).toBe(4.5);
    });

    test("should allow reviewCount to be zero", () => {
      const nb = new Notebook({ title: "Test", reviewCount: 0 });
      expect(nb.reviewCount).toBe(0);
    });

    test("should allow empty description", () => {
      const nb = new Notebook({ title: "Test", description: "" });
      expect(nb.description).toBe("");
    });

    test("should allow partial specs object", () => {
      const nb = new Notebook({
        title: "Test",
        specs: {
          screenSize: "15.6 inch",
          processor: "Intel Core i5",
        },
      });
      
      expect(nb.specs.screenSize).toBe("15.6 inch");
      expect(nb.specs.processor).toBe("Intel Core i5");
      expect(nb.specs.memory).toBeUndefined();
      expect(nb.specs.storage).toBeUndefined();
      expect(nb.specs.os).toBeUndefined();
    });
  });

  describe("immutability", () => {
    test("should have readonly id that cannot be modified", () => {
      const nb = new Notebook({ id: "original", title: "Test" });
      expect(nb.id).toBe("original");
    });
  });

  describe("interface implementation", () => {
    test("should implement INotebook interface", () => {
      const nb = new Notebook({
        id: "1",
        title: "Test",
        price: 100,
        description: "Test description",
        rating: 4.0,
        reviewCount: 10,
        specs: {
          screenSize: "15.6 inch",
        },
      });

      expect(nb.id).toBeDefined();
      expect(nb.title).toBeDefined();
      expect(nb.price).toBeDefined();
      expect(nb.description).toBeDefined();
      expect(nb.rating).toBeDefined();
      expect(nb.reviewCount).toBeDefined();
      expect(nb.specs).toBeDefined();
    });
  });
});
