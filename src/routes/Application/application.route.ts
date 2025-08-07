import { Router, Request, Response } from "express";
import * as ApplicationController from "../../controllers/Application/application.controller";
import { corsMiddleware } from "../../middleware/cors.middleware";

const router = Router();

// Apply CORS middleware to all routes
router.use(corsMiddleware);

// Health check route for applications
router.get("/health", (req: any, res: any) => {
  res.status(200).json({
    success: true,
    message: "Applications API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Public routes
router.post("/create", ApplicationController.createApplicationController);

// Admin routes
router.get("/", ApplicationController.getAllApplicationsController);
router.get("/search", ApplicationController.searchApplicationsController);
router.get("/statistics", ApplicationController.getApplicationStatisticsController);
router.get("/position/:position", ApplicationController.getApplicationsByPositionController);
router.get("/shortlisted", ApplicationController.getShortlistedApplicationsController);
router.get("/replied", ApplicationController.getRepliedApplicationsController);
router.get("/:id", ApplicationController.getApplicationByIdController);
router.patch("/:id/status", ApplicationController.updateApplicationStatusController);
router.delete("/:id", ApplicationController.deleteApplicationController);

export default router;
