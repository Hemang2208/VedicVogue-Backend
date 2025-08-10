import { IUser } from "../../models/Auth/user.model";
import { generateTokens } from "../jwt";
import { comparePassword } from "../password";
import {
  getUserByEmailService,
  addUserTokenService,
} from "../../services/Auth/user.service";
import {
  sanitizeUserForResponse,
  getClientIpAddress,
  parseDeviceInfo,
} from "../helpers";

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Validate login data
 */
export const validateLoginData = (
  data: LoginData
): {
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

  if (!data.password || data.password.trim().length === 0) {
    errors.push("Password is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Authenticate user with email and password
 */
export const authenticateUser = async (
  email: string,
  password: string
): Promise<{
  success: boolean;
  user?: IUser;
  error?: string;
}> => {
  try {
    // Get user with password field included
    const user = await getUserByEmailService(email.toLowerCase().trim());

    if (!user) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check if user is active and not banned
    if (!user.status.isActive) {
      return {
        success: false,
        error: "Account is deactivated. Please contact support.",
      };
    }

    if (user.status.ban.isBanned) {
      return {
        success: false,
        error: `Account is banned: ${user.status.ban.banReason}`,
      };
    }

    if (user.status.isDeleted) {
      return {
        success: false,
        error: "Account not found",
      };
    }

    // Compare password
    const isPasswordValid = await comparePassword(
      password,
      user.account.password
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      error: `Authentication failed: ${(error as Error).message}`,
    };
  }
};

/**
 * Generate and store user tokens
 */
export const generateAndStoreTokens = async (
  user: IUser,
  req: any,
  rememberMe: boolean = false
): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  try {
    // Generate tokens
    const tokens = generateTokens({
      userId: (user as any)._id.toString(),
      userID: user.userID,
      email: user.account.email,
      role: user.security?.role || "user",
    });

    // Get device info
    const ipAddress = getClientIpAddress(req);
    const userAgent = req.headers["user-agent"] || "";
    const deviceInfo = parseDeviceInfo(userAgent);

    // Prepare device details for token storage
    const deviceDetails = {
      type: deviceInfo.type,
      brand: "Unknown",
      model: "Unknown",
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      memory: 0,
      cores: 0,
    };

    // Store refresh token in user's tokens array
    await addUserTokenService(
      (user as any)._id.toString(),
      tokens.refreshToken,
      userAgent,
      deviceDetails
    );

    return tokens;
  } catch (error) {
    throw new Error(
      `Failed to generate and store tokens: ${(error as Error).message}`
    );
  }
};

/**
 * Complete login process
 */
export const processUserLogin = async (
  data: LoginData,
  req: any
): Promise<{
  success: boolean;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  user?: any;
  error?: {
    statusCode: number;
    message: string;
  };
}> => {
  try {
    // Validate login data
    const validation = validateLoginData(data);

    if (!validation.isValid) {
      return {
        success: false,
        error: {
          statusCode: 400,
          message: `Validation failed: ${validation.errors.join(", ")}`,
        },
      };
    }

    // Authenticate user
    const authResult = await authenticateUser(data.email, data.password);

    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: {
          statusCode: 401,
          message: authResult.error || "Authentication failed",
        },
      };
    }

    // Generate and store tokens
    const tokens = await generateAndStoreTokens(
      authResult.user,
      req,
      data.rememberMe
    );

    // Prepare user response (sanitized)
    const userResponse = sanitizeUserForResponse(authResult.user);

    return {
      success: true,
      tokens,
      user: userResponse,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        statusCode: 500,
        message: `Login failed: ${(error as Error).message}`,
      },
    };
  }
};
