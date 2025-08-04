import { Router } from "express";
import * as ApplicationController from "../controllers/application.controller";

const router = Router();

router.post("/create", ApplicationController.createApplicationController);

export default router;
