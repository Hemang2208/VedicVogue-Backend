import { Router } from "express";
import * as InternController from "../controllers/intern.controller";

const router = Router();

router.post("/create", InternController.createInternController);

export default router;
