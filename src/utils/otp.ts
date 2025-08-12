/**
 * Generate a random OTP
 * @param length - Length of the OTP (default: 6)
 * @returns string - The generated OTP
 */
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

/**
 * Validate OTP format
 * @param otp - The OTP to validate
 * @param length - Expected length (default: 6)
 * @returns boolean - True if valid, false otherwise
 */
export const validateOTP = (otp: string, length: number = 6): boolean => {
  if (!otp || typeof otp !== 'string') {
    return false;
  }
  
  return otp.length === length && /^\d+$/.test(otp);
};

/**
 * Check if OTP is expired
 * @param createdAt - When the OTP was created
 * @param expiryMinutes - Expiry time in minutes (default: 15)
 * @returns boolean - True if expired, false otherwise
 */
export const isOTPExpired = (createdAt: Date, expiryMinutes: number = 15): boolean => {
  const now = new Date();
  const expiryTime = new Date(createdAt.getTime() + (expiryMinutes * 60 * 1000));
  
  return now > expiryTime;
};
