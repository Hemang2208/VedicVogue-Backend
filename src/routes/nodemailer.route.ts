import { Router } from "express";
import {
  sendVerificationEmailController,
  sendContactReceivedEmailController,
  sendNewsletterSubscriptionEmailController,
  sendJoinUsReceivedEmailController,
  sendJoinUsApprovedEmailController,
  sendJoinUsRejectedEmailController,
  sendContactReplyEmailController,
  sendBulkEmailController,
  testEmailConfigController,
} from "../controllers/nodemailer.controller";
// import {
//   validateEmail,
//   validateOTP,
//   validateReplyMessage,
//   validateBulkEmail,
//   rateLimit,
// } from "../middleware/email.middleware";

const router = Router();

// Apply rate limiting to all routes
// router.use(rateLimit(200, 5 * 60 * 1000)); // 200 requests per 5 minutes

// Individual email sending routes with validation
router.post(
  "/send-verification",
  // validateEmail,
  // validateOTP,
  sendVerificationEmailController
);

router.post(
  "/send-contact-received",
  // validateEmail,
  sendContactReceivedEmailController
);

router.post(
  "/send-newsletter-subscription",
  // validateEmail,
  sendNewsletterSubscriptionEmailController
);

router.post(
  "/send-joinus-received",
  // validateEmail,
  sendJoinUsReceivedEmailController
);

router.post(
  "/send-joinus-approved",
  // validateEmail,
  sendJoinUsApprovedEmailController
);

router.post(
  "/send-joinus-rejected",
  // validateEmail,
  sendJoinUsRejectedEmailController
);

router.post(
  "/send-contact-reply",
  // validateEmail,
  // validateReplyMessage,
  sendContactReplyEmailController
);

// Bulk email sending route with special validation
router.post(
  "/send-bulk",
  // validateBulkEmail,
  sendBulkEmailController
);

// Test email configuration route
router.get("/test-config", testEmailConfigController);

export default router;
