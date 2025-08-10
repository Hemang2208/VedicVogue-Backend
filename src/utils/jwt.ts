import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET environment variable is not set");
}

export interface JWTPayload {
  userId: string;
  userID: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  userID: string;
  tokenVersion?: number;
  iat?: number;
  exp?: number;
}

/**
 * Generate access token
 */
export const generateAccessToken = (
  payload: Omit<JWTPayload, "iat" | "exp">
): string => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "vedic-vogue",
      audience: "vedic-vogue-users",
    });
  } catch (error) {
    throw new Error(
      `Error generating access token: ${(error as Error).message}`
    );
  }
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (
  payload: Omit<RefreshTokenPayload, "iat" | "exp">
): string => {
  try {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: "vedic-vogue",
      audience: "vedic-vogue-users",
    });
  } catch (error) {
    throw new Error(
      `Error generating refresh token: ${(error as Error).message}`
    );
  }
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "vedic-vogue",
      audience: "vedic-vogue-users",
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Access token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid access token");
    } else {
      throw new Error(`Token verification failed: ${(error as Error).message}`);
    }
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: "vedic-vogue",
      audience: "vedic-vogue-users",
    }) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token");
    } else {
      throw new Error(
        `Refresh token verification failed: ${(error as Error).message}`
      );
    }
  }
};

/**
 * Decode token without verification (for debugging purposes)
 */
export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error(`Token decoding failed: ${(error as Error).message}`);
  }
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (user: {
  userId: string;
  userID: string;
  email: string;
  role: string;
}): { accessToken: string; refreshToken: string } => {
  const accessTokenPayload: Omit<JWTPayload, "iat" | "exp"> = {
    userId: user.userId,
    userID: user.userID,
    email: user.email,
    role: user.role,
  };

  const refreshTokenPayload: Omit<RefreshTokenPayload, "iat" | "exp"> = {
    userId: user.userId,
    userID: user.userID,
    tokenVersion: 1,
  };

  const accessToken = generateAccessToken(accessTokenPayload);
  const refreshToken = generateRefreshToken(refreshTokenPayload);

  return { accessToken, refreshToken };
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string): string => {
  if (!authHeader) {
    throw new Error("No authorization header provided");
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new Error(
      "Invalid authorization header format. Expected 'Bearer <token>'"
    );
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!token) {
    throw new Error("No token provided in authorization header");
  }

  return token;
};
