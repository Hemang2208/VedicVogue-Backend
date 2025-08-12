import { Router } from "express";
import {
  sendVerificationOTPController,
  verifyEmailOTPController,
} from "../../controllers/EmailVerification/emailVerification.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

// Send verification OTP to user's email
router.post(
  "/send-verification-otp",
  authenticateToken,
  sendVerificationOTPController
);

// Verify OTP and update user verification status
router.post(
  "/verify-email-otp",
  authenticateToken,
  verifyEmailOTPController
);

export default router;
