import { Router } from "express";
import {
  createUserController,
  loginUserController,
  getUserByIdController,
  getUserByUserIdController,
  getUserByEmailController,
  getUserByPhoneController,
  updateUserController,
  updateUserPasswordController,
  updateUserStatusController,
  addUserTokenController,
  removeUserTokenController,
  addUserAddressController,
  updateUserAddressController,
  removeUserAddressController,
  addToUserCartController,
  removeFromUserCartController,
  clearUserCartController,
  addToUserFavoritesController,
  updateUserLoyaltyPointsController,
  deleteUserController,
  getAllUsersController,
  getUsersByRoleController,
  getActiveUsersController,
  getVerifiedUsersController,
  getBannedUsersController,
  searchUsersController,
  getUserStatisticsController,
  validateTokenController,
  refreshTokenController,
} from "../../controllers/Auth/user.controller";

const router = Router();

// Health check route for user
router.get("/health", (req: any, res: any) => {
  res.status(200).json({
    success: true,
    message: "User API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// User CRUD Operations
router.post("/create", createUserController);
router.post("/login", loginUserController);
router.get("/get/:id", getUserByIdController);
router.get("/get-by-userid/:userID", getUserByUserIdController);
router.post("/get-by-email", getUserByEmailController);
router.post("/get-by-phone", getUserByPhoneController);
router.put("/update/:id", updateUserController);
router.delete("/delete/:id", deleteUserController);

// User Authentication & Security
router.put("/update-password/:id", updateUserPasswordController);
router.put("/update-status/:id", updateUserStatusController);
router.post("/add-token/:id", addUserTokenController);
router.delete("/remove-token/:id", removeUserTokenController);

// Token Management
router.get("/validate-token", validateTokenController);
router.post("/refresh-token", refreshTokenController);

// User Address Management
router.post("/add-address/:id", addUserAddressController);
router.put("/update-address/:id/:addressIndex", updateUserAddressController);
router.delete("/remove-address/:id/:addressIndex", removeUserAddressController);

// User Cart Management
router.post("/add-to-cart/:id", addToUserCartController);
router.delete("/remove-from-cart/:id", removeFromUserCartController);
router.delete("/clear-cart/:id", clearUserCartController);

// User Favorites & Loyalty
router.post("/add-to-favorites/:id", addToUserFavoritesController);
router.put("/update-loyalty-points/:id", updateUserLoyaltyPointsController);

// User Query & Filtering
router.get("/get-all", getAllUsersController);
router.get("/get-by-role/:role", getUsersByRoleController);
router.get("/get-active", getActiveUsersController);
router.get("/get-verified", getVerifiedUsersController);
router.get("/get-banned", getBannedUsersController);
router.get("/search", searchUsersController);

// User Statistics & Analytics
router.get("/statistics", getUserStatisticsController);

export default router;
