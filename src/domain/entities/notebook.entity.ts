export interface INotebook {
    id: string;
    title: string;
    price: number;
    description: string;
    // screenSize: string;
    // processor: string;
    // memory: string;
    // storage: string;
    // os: string;
}

export class Notebook implements INotebook {
  public readonly id: string;
  public title: string;
  public price: number;
  public description: string;
  //   public screenSize: string;
  //   public processor: string;
  //   public memory: string;
  //   public storage: string;
  //   public os: string;

  constructor(data: Partial<INotebook>) {
    if (!data.title?.trim()) {
      throw new Error ("Title is required");
    }
    this.id = data.id ?? "";
    this.title = data.title ?? "";
    this.price = data.price ?? 0;
    this.description = data.description ?? "";
    // this.screenSize = data.screenSize || "";
    // this.processor = data.processor || "";
    // this.memory = data.memory || "";
    // this.storage = data.storage || "";
    // this.os = data.os || "";
  }
}