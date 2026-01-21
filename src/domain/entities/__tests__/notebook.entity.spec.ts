import { Notebook } from "../notebook.entity";

describe("Notebook entity", () => {
  test("constructs with provided values and defaults", () => {
    const nb = new Notebook({ title: "Lenovo Test", price: 123.45, description: "desc" });

    expect(nb.title).toBe("Lenovo Test");
    expect(nb.price).toBe(123.45);
    expect(nb.description).toBe("desc");
    expect(nb.id).toBe("");
    expect(nb.rating).toBe(0);
    expect(nb.reviewCount).toBe(0);
    expect(nb.specs).toEqual({});
  });

  test("throws when title is missing or empty", () => {
    expect(() => new Notebook({} as any)).toThrow("Title is required");
    expect(() => new Notebook({ title: "   " })).toThrow("Title is required");
  });
});
