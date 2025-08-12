import { decrypt, encrypt } from "../../configs/crypto";
import { getUserByEmailService } from "../../services/Auth/user.service";
import { sendVerificationEmail } from "../../services/nodemailer.service";
import { updateUserPasswordService } from "../../services/Auth/user.service";
import { hashPassword } from "../../utils/password";

// Temporary storage for OTPs (In production, use Redis or database)
interface OTPData {
  email: string;
  otp: string;
  expires: Date;
}

const otpStorage: Map<string, OTPData> = new Map();

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for password reset
export const sendPasswordResetOTPController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { data } = req.body;
    const { email } = JSON.parse(decrypt(data));

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    // Check if user exists
    const user = await getUserByEmailService(email);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP
    otpStorage.set(email, { email, otp, expires });

    // Send OTP email
    await sendVerificationEmail({
      email,
      name: user.fullname,
      otp,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email address",
    });
  } catch (error: unknown) {
    console.log("Error sending password reset OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

// Verify OTP for password reset
export const verifyPasswordResetOTPController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { data } = req.body;
    const { email, otp } = JSON.parse(decrypt(data));

    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
      return;
    }

    // Get stored OTP
    const storedOTPData = otpStorage.get(email);
    if (!storedOTPData) {
      res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
      return;
    }

    // Check if OTP is expired
    if (new Date() > storedOTPData.expires) {
      otpStorage.delete(email);
      res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
      return;
    }

    // Verify OTP
    if (storedOTPData.otp !== otp) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error: unknown) {
    console.log("Error verifying password reset OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

// Reset password after OTP verification
export const resetPasswordController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { data } = req.body;
    const { email, otp, newPassword, confirmPassword } = JSON.parse(decrypt(data));

    if (!email || !otp || !newPassword || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    // Verify passwords match
    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
      return;
    }

    // Get stored OTP
    const storedOTPData = otpStorage.get(email);
    if (!storedOTPData) {
      res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
      return;
    }

    // Check if OTP is expired
    if (new Date() > storedOTPData.expires) {
      otpStorage.delete(email);
      res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
      return;
    }

    // Verify OTP
    if (storedOTPData.otp !== otp) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
      return;
    }

    // Get user
    const user = await getUserByEmailService(email);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    const updatedUser = await updateUserPasswordService((user as any)._id, hashedPassword);

    if (!updatedUser) {
      res.status(500).json({
        success: false,
        message: "Failed to update password",
      });
      return;
    }

    // Clear OTP from storage
    otpStorage.delete(email);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error: unknown) {
    console.log("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};
