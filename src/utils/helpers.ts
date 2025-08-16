export const getClientIpAddress = (req: any): string => {
  const xForwardedFor = req.headers["x-forwarded-for"] as string;
  const xRealIp = req.headers["x-real-ip"] as string;
  const cfConnectingIp = req.headers["cf-connecting-ip"] as string;

  if (xForwardedFor) {
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

export const generateMenuId = (): string => {
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

  return `MENU${YYYY}${MM}${DD}${HH}${mm}${ss}${randomNum}`;
};

export const sanitizeUserForResponse = (user: any) => {
  const userObj = user.toObject ? user.toObject() : user;
  
  // Remove sensitive fields
  delete userObj.account?.password;
  delete userObj.security?.tokens;
  
  return userObj;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getDeviceInfo = (req: any) => {
  const userAgent = req.headers["user-agent"] || "";
  const ipAddress = getClientIpAddress(req);
  
  // Parse user agent for device info
  const isChrome = userAgent.includes("Chrome");
  const isSafari = userAgent.includes("Safari") && !isChrome;
  const isFirefox = userAgent.includes("Firefox");
  const isEdge = userAgent.includes("Edge");
  
  const isWindows = userAgent.includes("Windows");
  const isMac = userAgent.includes("Mac OS");
  const isLinux = userAgent.includes("Linux");
  const isAndroid = userAgent.includes("Android");
  const isiOS = userAgent.includes("iPhone") || userAgent.includes("iPad");
  
  let browser = "Unknown";
  if (isChrome) browser = "Chrome";
  else if (isSafari) browser = "Safari";
  else if (isFirefox) browser = "Firefox";
  else if (isEdge) browser = "Edge";
  
  let os = "Unknown";
  if (isWindows) os = "Windows";
  else if (isMac) os = "Mac OS";
  else if (isLinux) os = "Linux";
  else if (isAndroid) os = "Android";
  else if (isiOS) os = "iOS";
  
  return {
    browser,
    os,
    userAgent,
    ipAddress,
  };
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

export const generateRandomString = (length: number = 32): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

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

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get location information based on IP address
 * This is a simplified implementation - in production, you'd use a proper geolocation service
 * @param ipAddress - IP address to get location for
 * @returns Location string or "Unknown location"
 */
export const getLocationFromIP = (ipAddress: string): string => {
  // For localhost and private IPs, return a default location
  if (!ipAddress || 
      ipAddress === '127.0.0.1' || 
      ipAddress === '::1' || 
      ipAddress.startsWith('192.168.') || 
      ipAddress.startsWith('10.') || 
      ipAddress.startsWith('172.')) {
    return 'Local Network, India';
  }

  // For demo purposes, return a default Indian location
  // In production, you would integrate with a geolocation API like:
  // - MaxMind GeoIP2
  // - IP-API
  // - ipinfo.io
  // - ipgeolocation.io
  return 'India';
};
