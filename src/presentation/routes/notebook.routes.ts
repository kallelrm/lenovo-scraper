import { Router } from "express";
import { notebookRateLimiter } from "../middlewares/rate-limiter";
import { NotebookController } from "../controllers/notebook.controller";

const router = Router();
const controller = new NotebookController();

router.get("/notebooks", notebookRateLimiter, controller.getNotebooks.bind(controller));

export default router;