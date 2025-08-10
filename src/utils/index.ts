// JWT Utils
export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
  extractTokenFromHeader,
  decodeToken,
  type JWTPayload,
  type RefreshTokenPayload,
} from "./jwt";

// Password Utils
export {
  hashPassword,
  comparePassword,
  validatePassword,
} from "./password";

// Helper Utils
export {
  getClientIpAddress,
  generateUserId,
  sanitizeUserForResponse,
  isValidEmail,
  isValidPhone,
  generateRandomString,
  parseDeviceInfo,
  sleep,
} from "./helpers";

// User Utils
export {
  prepareUserData,
  processUserCreation,
  type CreateUserData,
} from "./user/userCreation";

export {
  authenticateUser,
  generateAndStoreTokens,
  processUserLogin,
  type LoginData,
} from "./user/userAuth";

export {
  validatePasswordChangeData,
  processPasswordChange,
  validatePasswordResetRequest,
  processPasswordReset,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generatePasswordResetLink,
  checkPasswordStrength,
  type PasswordChangeData,
  type PasswordResetData,
} from "./user/userPassword";

// Common types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

// Database query helpers
export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  populate?: string[];
  select?: string;
  lean?: boolean;
}

// File upload types
export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  destination?: string;
}

// Search options
export interface SearchOptions {
  query: string;
  fields?: string[];
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

// Environment configuration
export interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CRYPTO_SECRET: string;
  BCRYPT_SALT_ROUNDS: string;
  FRONTEND_URL: string;
  ADMIN_URL: string;
}
