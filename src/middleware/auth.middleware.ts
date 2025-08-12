import { verifyAccessToken, extractTokenFromHeader } from "../utils/jwt";
import { getUserByIdService } from "../services/Auth/user.service";

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = async (
  req: any,
  res: any,
  next: any
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Access token required",
      });
      return;
    }

    // Extract token from header
    const token = extractTokenFromHeader(authHeader);

    // Verify the token
    const decoded = verifyAccessToken(token);

    // Get user from database to ensure they still exist and are active
    const user = await getUserByIdService(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      });
      return;
    }

    if (!user.status.isActive) {
      res.status(403).json({
        success: false,
        message: "Your account is inactive. Kindly talk to Support on /contact to get your account updated.",
      });
      return;
    }

    if (user.status.ban.isBanned) {
      res.status(403).json({
        success: false,
        message: "Your account is banned. Kindly talk to Support on /contact to get your account updated.",
      });
      return;
    }

    if (user.status.isDeleted) {
      res.status(403).json({
        success: false,
        message: "Your account is deleted. Kindly talk to Support on /contact to get your account updated.",
      });
      return;
    }

    // Add user info to request object
    req.user = {
      userId: user._id,
      userID: user.userID,
      email: user.account.email,
      role: user.security?.role || "user",
      fullname: user.fullname,
    };

    next();
  } catch (error) {
    console.log("Authentication error:", error);
    
    const errorMessage = (error as Error).message;
    
    if (errorMessage.includes("expired")) {
      res.status(401).json({
        success: false,
        message: "Token expired",
      });
    } else if (errorMessage.includes("invalid")) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }
  }
};

/**
 * Middleware to authorize user roles
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: any, res: any, next: any): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

/**
 * Middleware for optional authentication (user might or might not be logged in)
 */
export const optionalAuth = async (
  req: any,
  res: any,
  next: any
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // No token provided, continue without user
      req.user = null;
      next();
      return;
    }

    // Try to extract and verify token
    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await getUserByIdService(decoded.userId);

    if (user && user.status.isActive && !user.status.ban.isBanned && !user.status.isDeleted) {
      req.user = {
        userId: user._id,
        userID: user.userID,
        email: user.account.email,
        role: user.security?.role || "user",
        fullname: user.fullname,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user
    req.user = null;
    next();
  }
};
