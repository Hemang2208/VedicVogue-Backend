import express from "express";
import {
  getSecuritySettingsController,
  updateSecuritySettingsController,
  changePasswordController,
  getActiveSessionsController,
  terminateSessionController,
  terminateAllSessionsController,
  getSecurityActivityController,
  getSecurityActivitySummaryController,
  logSecurityActivityController,
} from "../../controllers/Auth/security.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = express.Router();

// All security routes require authentication
router.use(authenticateToken);

// Security settings routes
router.get("/settings", getSecuritySettingsController);
router.put("/settings", updateSecuritySettingsController);

// Password management routes
router.post("/change-password", changePasswordController);

// Session management routes
router.get("/sessions", getActiveSessionsController);
router.delete("/sessions/:sessionId", terminateSessionController);
router.delete("/sessions", terminateAllSessionsController);

// Security activity routes
router.get("/activity", getSecurityActivityController);
router.get("/activity/summary", getSecurityActivitySummaryController);
router.post("/activity/log", logSecurityActivityController);

export default router;
