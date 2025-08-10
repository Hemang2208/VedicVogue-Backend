import { hashPassword, comparePassword, validatePassword } from "../password";
import { getUserByIdService, updateUserPasswordService } from "../../services/Auth/user.service";
import { generateRandomString } from "../helpers";
import crypto from "crypto";

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetData {
  email: string;
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
}

/**
 * Validate password change data
 */
export const validatePasswordChangeData = (data: PasswordChangeData): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!data.currentPassword || data.currentPassword.trim().length === 0) {
    errors.push("Current password is required");
  }

  if (!data.newPassword || data.newPassword.trim().length === 0) {
    errors.push("New password is required");
  } else {
    const passwordValidation = validatePassword(data.newPassword);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  if (!data.confirmPassword || data.confirmPassword.trim().length === 0) {
    errors.push("Confirm password is required");
  }

  if (data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword) {
    errors.push("New password and confirm password do not match");
  }

  if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
    errors.push("New password must be different from current password");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Process password change
 */
export const processPasswordChange = async (
  userId: string,
  data: PasswordChangeData
): Promise<{
  success: boolean;
  error?: {
    statusCode: number;
    message: string;
  };
}> => {
  try {
    // Validate input data
    const validation = validatePasswordChangeData(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: {
          statusCode: 400,
          message: `Validation failed: ${validation.errors.join(", ")}`,
        },
      };
    }

    // Get user with password
    const user = await getUserByIdService(userId);
    if (!user) {
      return {
        success: false,
        error: {
          statusCode: 404,
          message: "User not found",
        },
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      data.currentPassword,
      (user as any).account.password
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: {
          statusCode: 401,
          message: "Current password is incorrect",
        },
      };
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(data.newPassword);

    // Update password
    await updateUserPasswordService(userId, hashedNewPassword);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        statusCode: 500,
        message: `Failed to change password: ${(error as Error).message}`,
      },
    };
  }
};

/**
 * Validate password reset request data
 */
export const validatePasswordResetRequest = (data: PasswordResetData): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!data.email || data.email.trim().length === 0) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate password reset token
 */
export const generatePasswordResetToken = (): {
  token: string;
  expires: Date;
} => {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

  return {
    token,
    expires,
  };
};

/**
 * Verify password reset token
 */
export const verifyPasswordResetToken = (
  tokenData: { token: string; expires: Date },
  providedToken: string
): boolean => {
  if (!tokenData || !providedToken) {
    return false;
  }

  // Check if token matches
  if (tokenData.token !== providedToken) {
    return false;
  }

  // Check if token is expired
  if (new Date() > tokenData.expires) {
    return false;
  }

  return true;
};

/**
 * Process password reset
 */
export const processPasswordReset = async (
  data: PasswordResetData & { userId: string; resetTokenData: { token: string; expires: Date } }
): Promise<{
  success: boolean;
  error?: {
    statusCode: number;
    message: string;
  };
}> => {
  try {
    // Validate required fields
    if (!data.token || !data.newPassword || !data.confirmPassword) {
      return {
        success: false,
        error: {
          statusCode: 400,
          message: "Token, new password, and confirm password are required",
        },
      };
    }

    // Verify token
    if (!verifyPasswordResetToken(data.resetTokenData, data.token)) {
      return {
        success: false,
        error: {
          statusCode: 400,
          message: "Invalid or expired reset token",
        },
      };
    }

    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      return {
        success: false,
        error: {
          statusCode: 400,
          message: "New password and confirm password do not match",
        },
      };
    }

    // Validate password strength
    const passwordValidation = validatePassword(data.newPassword);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        error: {
          statusCode: 400,
          message: `Password validation failed: ${passwordValidation.errors.join(", ")}`,
        },
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword);

    // Update password
    await updateUserPasswordService(data.userId, hashedPassword);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        statusCode: 500,
        message: `Failed to reset password: ${(error as Error).message}`,
      },
    };
  }
};

/**
 * Generate secure password reset link
 */
export const generatePasswordResetLink = (
  baseUrl: string,
  token: string,
  email: string
): string => {
  const encodedEmail = encodeURIComponent(email);
  return `${baseUrl}/reset-password?token=${token}&email=${encodedEmail}`;
};

/**
 * Check password strength level
 */
export const checkPasswordStrength = (password: string): {
  strength: "weak" | "medium" | "strong" | "very-strong";
  score: number;
  feedback: string[];
} => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push("Use at least 8 characters");

  if (password.length >= 12) score += 1;
  else if (password.length >= 8) feedback.push("Use 12+ characters for better security");

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Add uppercase letters");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Add numbers");

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push("Add special characters");

  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push("Avoid repeating characters");

  let strength: "weak" | "medium" | "strong" | "very-strong";
  if (score <= 2) strength = "weak";
  else if (score <= 4) strength = "medium";
  else if (score <= 6) strength = "strong";
  else strength = "very-strong";

  return { strength, score, feedback };
};
