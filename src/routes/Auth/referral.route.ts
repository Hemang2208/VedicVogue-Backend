import { Router } from "express";
import {
  getUserReferralDataController,
  claimReferralRewardController,
  updateReferralSettingsController,
  validateReferralCodeController,
  getReferralStatsController
} from "../../controllers/Auth/referral.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @route GET /api/auth/referral
 * @description Get user's referral data
 * @access Private (requires authentication)
 */
router.get(
  "/",
  authenticateToken,
  getUserReferralDataController
);

/**
 * @route GET /api/auth/referral/stats
 * @description Get user's referral statistics
 * @access Private (requires authentication)
 */
router.get(
  "/stats",
  authenticateToken,
  getReferralStatsController
);

/**
 * @route POST /api/auth/referral/claim
 * @description Claim a referral reward
 * @access Private (requires authentication)
 */
router.post(
  "/claim",
  authenticateToken,
  claimReferralRewardController
);

/**
 * @route PUT /api/auth/referral/settings
 * @description Update referral settings
 * @access Private (requires authentication)
 */
router.put(
  "/settings",
  authenticateToken,
  updateReferralSettingsController
);

/**
 * @route POST /api/auth/referral/validate
 * @description Validate a referral code (public endpoint for signup)
 * @access Public
 */
router.post(
  "/validate",
  validateReferralCodeController
);

export default router;
