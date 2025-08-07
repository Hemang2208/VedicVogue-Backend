import { Router } from "express";
import * as InternController from "../../controllers/Application/intern.controller";
import { corsMiddleware } from "../../middleware/cors.middleware";

const router = Router();

// Apply CORS middleware to all routes
router.use(corsMiddleware);

// Public routes
router.post("/create", InternController.createInternController);

// Admin routes
router.get("/", InternController.getAllInternsController);
router.get("/search", InternController.searchInternsController);
router.get("/statistics", InternController.getInternStatisticsController);
router.get("/:id", InternController.getInternByIdController);
router.patch("/:id/status", InternController.updateInternStatusController);
router.delete("/:id", InternController.deleteInternController);

export default router;
