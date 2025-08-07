import { Router, Request, Response } from "express";
import * as GeneralContactController from "../../controllers/Contact/generalContact.controller";
import { corsMiddleware } from "../../middleware/cors.middleware";

const router = Router();

// Apply CORS middleware to all routes
router.use(corsMiddleware);

// Health check route for general contacts
router.get("/health", (req: any, res: any) => {
  res.status(200).json({
    success: true,
    message: "General Contact API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Public routes
router.post("/create", GeneralContactController.createGeneralContactController);

// Admin routes
router.get("/", GeneralContactController.getAllGeneralContactsController);
router.get("/search", GeneralContactController.searchGeneralContactsController);
router.get("/statistics", GeneralContactController.getGeneralContactStatisticsController);
router.get("/status/:status", GeneralContactController.getContactsByStatusController);
router.get("/priority/:priority", GeneralContactController.getContactsByPriorityController);
router.get("/issue-type/:issueType", GeneralContactController.getContactsByIssueTypeController);
router.get("/pending", GeneralContactController.getPendingContactsController);
router.get("/resolved", GeneralContactController.getResolvedContactsController);
router.get("/assigned/:assignedTo", GeneralContactController.getAssignedContactsController);
router.get("/:id", GeneralContactController.getGeneralContactByIdController);

// Admin action routes
router.patch("/:id/status", GeneralContactController.updateGeneralContactStatusController);
router.patch("/:contactId/assign", GeneralContactController.assignContactToAgentController);
router.patch("/:contactId/resolve", GeneralContactController.markContactAsResolvedController);
router.delete("/:id", GeneralContactController.deleteGeneralContactController);

// Soft delete management routes
router.get("/deleted/all", GeneralContactController.getAllDeletedContactsController);
router.patch("/:id/restore", GeneralContactController.restoreGeneralContactController);
router.delete("/:id/permanent", GeneralContactController.permanentlyDeleteContactController);
router.post("/bulk-delete", GeneralContactController.bulkDeleteContactsController);
router.post("/bulk-restore", GeneralContactController.bulkRestoreContactsController);

export default router;
