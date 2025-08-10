/**
 * Extract IP address from request
 */
export const getClientIpAddress = (req: any): string => {
  const xForwardedFor = req.headers["x-forwarded-for"] as string;
  const xRealIp = req.headers["x-real-ip"] as string;
  const cfConnectingIp = req.headers["cf-connecting-ip"] as string;

  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(",")[0].trim();
  }

  if (xRealIp) {
    return xRealIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return req.socket?.remoteAddress || req.connection?.remoteAddress || "UNKNOWN";
};

/**
 * Generate unique user ID
 */
export const generateUserId = (): string => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const YYYY = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const DD = pad(now.getDate());
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  const randomNum = Math.floor(Math.random() * 100000) // 5-digit random number
    .toString()
    .padStart(6, "0"); // 6-digit random number

  return `USER${YYYY}${MM}${DD}${HH}${mm}${ss}${randomNum}`;
};

/**
 * Sanitize user data for response
 */
export const sanitizeUserForResponse = (user: any) => {
  const userObj = user.toObject ? user.toObject() : user;
  
  // Remove sensitive fields
  delete userObj.account?.password;
  delete userObj.security?.tokens;
  
  return userObj;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Generate random string
 */
export const generateRandomString = (length: number = 32): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Parse device info from user agent
 */
export const parseDeviceInfo = (userAgent: string) => {
  // Basic device detection - you might want to use a more sophisticated library
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const isTablet = /iPad|Tablet/.test(userAgent);
  const isDesktop = !isMobile && !isTablet;
  
  let browser = 'Unknown';
  let os = 'Unknown';
  
  // Browser detection
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  // OS detection
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return {
    type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    browser,
    os,
    mobile: isMobile,
    tablet: isTablet,
    desktop: isDesktop,
  };
};

/**
 * Sleep utility for async operations
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
