import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const SALT_NUMBER = process.env.BCRYPT_SALT_ROUNDS;
if (!SALT_NUMBER || isNaN(parseInt(SALT_NUMBER))) {
  throw new Error("Invalid or missing BCRYPT_SALT_ROUNDS");
}

const SALT_ROUNDS = parseInt(SALT_NUMBER);

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    if (!password || typeof password !== "string") {
      throw new Error("Invalid password provided");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Error hashing password: ${(error as Error).message}`);
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns Boolean indicating if passwords match
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    if (!password || !hashedPassword) {
      throw new Error("Password and hashed password are required");
    }

    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Error comparing password: ${(error as Error).message}`);
  }
};

/**
 * Check if password meets security requirements
 * @param password - Plain text password
 * @returns Object with validation result and messages
 */
export const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!password) {
    errors.push("Password is required");
  } else {
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (password.length > 128) {
      errors.push("Password must not exceed 128 characters");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push(
        "Password must contain at least one special character (@$!%*?&)"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate a random password
 * @param length - Length of the password (default: 12)
 * @returns Generated password
 */
export const generateRandomPassword = (length: number = 12): string => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "@$!%*?&";
  const allChars = lowercase + uppercase + numbers + symbols;

  let password = "";

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

/**
 * Check if a password needs to be rehashed (if salt rounds changed)
 * @param hashedPassword - Current hashed password
 * @returns Boolean indicating if rehashing is needed
 */
export const needsRehash = (hashedPassword: string): boolean => {
  try {
    const rounds = bcrypt.getRounds(hashedPassword);
    return rounds < SALT_ROUNDS;
  } catch (error) {
    // If we can't determine rounds, assume rehashing is needed
    return true;
  }
};
