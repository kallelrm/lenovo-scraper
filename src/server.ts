import dotenv from "dotenv";
dotenv.config({
  debug: true
});

import express, { Request, Response } from "express";
import cors from "cors";
import notebookRoutes from "./presentation/routes/notebook.routes";

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  methods: ["GET", "OPTIONS"],
})); 

app.use(express.json());

app.use("/api", notebookRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});


app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "lenovo-notebooks-scraper",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});