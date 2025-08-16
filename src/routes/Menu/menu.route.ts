import { Router } from "express";
import MenuController from "../../controllers/Menu/menu.controller";
import {
  createMenuItemValidation,
  updateMenuItemValidation,
  getMenuItemValidation,
  getMenuItemsValidation,
  updateRatingValidation,
  searchMenuValidation,
} from "../../middleware/validation/menu.validation";

const router = Router();

// Public routes (no authentication required)

/**
 * @route GET /api/menu
 * @desc Get all menu items with filters and pagination
 * @access Public
 */
router.get("/", getMenuItemsValidation, MenuController.getMenuItems);

/**
 * @route GET /api/menu/search
 * @desc Search menu items
 * @access Public
 */
router.get("/search", searchMenuValidation, MenuController.searchMenuItems);

/**
 * @route GET /api/menu/categories
 * @desc Get menu categories with counts
 * @access Public
 */
router.get("/categories", MenuController.getMenuCategories);

/**
 * @route GET /api/menu/featured
 * @desc Get featured menu items
 * @access Public
 */
router.get("/featured", MenuController.getFeaturedItems);

/**
 * @route GET /api/menu/:id
 * @desc Get menu item by ID
 * @access Public
 */
router.get("/:id", getMenuItemValidation, MenuController.getMenuItemById);

// Protected routes (authentication required)
// Note: Add authentication middleware as needed

/**
 * @route POST /api/menu
 * @desc Create a new menu item
 * @access Private (Admin/Kitchen)
 */
router.post("/", MenuController.createMenuItem);

/**
 * @route PUT /api/menu/:id
 * @desc Update menu item
 * @access Private (Admin/Kitchen)
 */
router.put("/:id", MenuController.updateMenuItem);

/**
 * @route DELETE /api/menu/:id
 * @desc Delete menu item (soft delete)
 * @access Private (Admin)
 */
router.delete("/:id", MenuController.deleteMenuItem);

/**
 * @route PATCH /api/menu/:id/toggle-availability
 * @desc Toggle menu item availability
 * @access Private (Admin/Kitchen)
 */
router.patch("/:id/toggle-availability", MenuController.toggleAvailability);

/**
 * @route POST /api/menu/:id/rating
 * @desc Update menu item rating
 * @access Private (User)
 */
router.post("/:id/rating", updateRatingValidation, MenuController.updateRating);

/**
 * @route PUT /api/menu/bulk-update
 * @desc Bulk update menu items
 * @access Private (Admin)
 */
router.put("/bulk-update", MenuController.bulkUpdateItems);

export default router;
