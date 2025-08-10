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

export const generateAndStoreTokens = async (
  user: IUser,
  req: any
): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  try {
    const tokens = generateTokens({
      userId: (user as any)._id.toString(),
      userID: user.userID,
      email: user.account.email,
      role: user.security?.role || "user",
    });

    const ipAddress = getClientIpAddress(req);
    const userAgent = req.headers["user-agent"] || "";
    const deviceInfo = parseDeviceInfo(userAgent);

    const deviceDetails = {
      ipAddress: ipAddress,
      type: deviceInfo.type,
      brand: "Unknown",
      model: "Unknown",
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      memory: 0,
      cores: 0,
    };

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

    const userResponse = authResult.user;

    const tokens = await generateAndStoreTokens(userResponse, req);

    return {
      success: true,
      tokens,
      user: {
        user: userResponse,
        tokens,
      },
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
