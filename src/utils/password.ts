import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const SALT_NUMBER = process.env.BCRYPT_SALT_ROUNDS;
if (!SALT_NUMBER || isNaN(parseInt(SALT_NUMBER))) {
  throw new Error("Invalid or missing BCRYPT_SALT_ROUNDS");
}

const SALT_ROUNDS = parseInt(SALT_NUMBER);

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
