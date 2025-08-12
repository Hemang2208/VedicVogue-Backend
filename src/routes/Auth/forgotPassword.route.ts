import { Router } from "express";
import {
  sendPasswordResetOTPController,
  verifyPasswordResetOTPController,
  resetPasswordController,
} from "../../controllers/Auth/forgotPassword.controller";

const router = Router();

// Forgot password routes
router.post("/send-otp", sendPasswordResetOTPController);
router.post("/verify-otp", verifyPasswordResetOTPController);
router.post("/reset-password", resetPasswordController);

export default router;
