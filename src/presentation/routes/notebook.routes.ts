import { Router } from "express";
import { NotebookController } from "../controllers/notebook.controller";

const router = Router();
const controller = new NotebookController();

router.get("/notebooks", controller.getNotebooks.bind(controller));

export default router;