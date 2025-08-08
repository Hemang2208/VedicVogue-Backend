import { Request, Response } from "express";
import {
  sendVerificationEmail,
  sendReceivedContactMail,
  sendReceivedNewsLetterMail,
  sendReceivedJoinUsMail,
  sendApprovedJoinUsMail,
  sendRejectedJoinUsMail,
  sendContactReplyMail,
} from "../services/nodemailer.service";

// Interface for email request body validation
interface EmailRequestBody {
  email: string;
  name?: string;
  otp?: string;
  subject?: string;
  replyMessage?: string;
  adminName?: string;
}

interface BulkEmailRequestBody {
  emails: EmailRequestBody[];
  type: string;
}

// Send Verification Email
export const sendVerificationEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, name, otp } = req.body as unknown as EmailRequestBody;

    if (!email || !otp) {
      (res.status as any)(400).json({
        success: false,
        message: "Email and OTP are required",
      });
      return;
    }

    await sendVerificationEmail({ email, name, otp });

    (res.status as any)(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    (res.status as any)(500).json({
      success: false,
      message: "Failed to send verification email",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Send Contact Received Email
export const sendContactReceivedEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, name } = req.body as unknown as EmailRequestBody;

    if (!email) {
      (res.status as any)(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    await sendReceivedContactMail({ email, name });

    (res.status as any)(200).json({
      success: true,
      message: "Contact received email sent successfully",
    });
  } catch (error) {
    console.error("Error sending contact received email:", error);
    (res.status as any)(500).json({
      success: false,
      message: "Failed to send contact received email",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Send Newsletter Subscription Email
export const sendNewsletterSubscriptionEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, name } = req.body as unknown as EmailRequestBody;

    if (!email) {
      (res.status as any)(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    await sendReceivedNewsLetterMail({ email, name });

    (res.status as any)(200).json({
      success: true,
      message: "Newsletter subscription email sent successfully",
    });
  } catch (error) {
    console.error("Error sending newsletter subscription email:", error);
    (res.status as any)(500).json({
      success: false,
      message: "Failed to send newsletter subscription email",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Send Join Us Application Received Email
export const sendJoinUsReceivedEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, name } = req.body as unknown as EmailRequestBody;

    if (!email) {
      (res.status as any)(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    await sendReceivedJoinUsMail({ email, name });

    (res.status as any)(200).json({
      success: true,
      message: "Join us application received email sent successfully",
    });
  } catch (error) {
    console.error("Error sending join us received email:", error);
    (res.status as any)(500).json({
      success: false,
      message: "Failed to send join us application received email",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Send Join Us Application Approved Email
export const sendJoinUsApprovedEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, name } = req.body as unknown as EmailRequestBody;

    if (!email) {
      (res.status as any)(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    await sendApprovedJoinUsMail({ email, name });

    (res.status as any)(200).json({
      success: true,
      message: "Join us application approved email sent successfully",
    });
  } catch (error) {
    console.error("Error sending join us approved email:", error);
    (res.status as any)(500).json({
      success: false,
      message: "Failed to send join us application approved email",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Send Join Us Application Rejected Email
export const sendJoinUsRejectedEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, name } = req.body as unknown as EmailRequestBody;

    if (!email) {
      (res.status as any)(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    await sendRejectedJoinUsMail({ email, name });

    (res.status as any)(200).json({
      success: true,
      message: "Join us application rejected email sent successfully",
    });
  } catch (error) {
    console.error("Error sending join us rejected email:", error);
    (res.status as any)(500).json({
      success: false,
      message: "Failed to send join us application rejected email",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Send Contact Reply Email
export const sendContactReplyEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, name, subject, replyMessage, adminName } = req.body as unknown as EmailRequestBody;

    if (!email || !replyMessage) {
      (res.status as any)(400).json({
        success: false,
        message: "Email and reply message are required",
      });
      return;
    }

    await sendContactReplyMail({
      email,
      name,
      subject,
      replyMessage,
      adminName,
    });

    (res.status as any)(200).json({
      success: true,
      message: "Contact reply email sent successfully",
    });
  } catch (error) {
    console.error("Error sending contact reply email:", error);
    (res.status as any)(500).json({
      success: false,
      message: "Failed to send contact reply email",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Send Multiple Emails (Bulk Email Controller)
export const sendBulkEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { emails, type } = req.body as unknown as BulkEmailRequestBody;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      (res.status as any)(400).json({
        success: false,
        message: "Emails array is required",
      });
      return;
    }

    if (!type) {
      (res.status as any)(400).json({
        success: false,
        message: "Email type is required",
      });
      return;
    }

    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const emailData of emails) {
      try {
        const { email, name, otp, subject, replyMessage, adminName } = emailData;

        if (!email) {
          results.push({
            email: "unknown",
            success: false,
            error: "Email is required",
          });
          continue;
        }

        switch (type) {
          case "verification":
            if (!otp) {
              results.push({
                email,
                success: false,
                error: "OTP is required for verification emails",
              });
              continue;
            }
            await sendVerificationEmail({ email, name, otp });
            break;

          case "contact-received":
            await sendReceivedContactMail({ email, name });
            break;

          case "newsletter":
            await sendReceivedNewsLetterMail({ email, name });
            break;

          case "joinus-received":
            await sendReceivedJoinUsMail({ email, name });
            break;

          case "joinus-approved":
            await sendApprovedJoinUsMail({ email, name });
            break;

          case "joinus-rejected":
            await sendRejectedJoinUsMail({ email, name });
            break;

          case "contact-reply":
            if (!replyMessage) {
              results.push({
                email,
                success: false,
                error: "Reply message is required for contact reply emails",
              });
              continue;
            }
            await sendContactReplyMail({
              email,
              name,
              subject,
              replyMessage,
              adminName,
            });
            break;

          default:
            results.push({
              email,
              success: false,
              error: "Invalid email type",
            });
            continue;
        }

        results.push({ email, success: true });
      } catch (error) {
        results.push({
          email: emailData.email || "unknown",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    (res.status as any)(200).json({
      success: true,
      message: `Bulk email operation completed. ${successCount} successful, ${failureCount} failed.`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
      },
    });
  } catch (error) {
    console.error("Error in bulk email operation:", error);
    (res.status as any)(500).json({
      success: false,
      message: "Failed to process bulk email operation",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Test Email Configuration
export const testEmailConfigController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const testEmail = process.env.GMAIL_USER;

    if (!testEmail) {
      (res.status as any)(400).json({
        success: false,
        message: "Test email configuration is not set",
      });
      return;
    }

    await sendVerificationEmail({
      email: testEmail,
      name: "Test User",
      otp: "123456",
    });

    (res.status as any)(200).json({
      success: true,
      message: "Test email sent successfully to configured email address",
      testEmail,
    });
  } catch (error) {
    console.error("Error testing email configuration:", error);
    (res.status as any)(500).json({
      success: false,
      message: "Email configuration test failed",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};