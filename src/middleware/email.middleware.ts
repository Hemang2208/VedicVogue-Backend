// Email validation middleware
export const validateEmail = (req: Request, res: Response, next: any): void => {
  const { email } = req.body as unknown as { email: string };

  if (!email) {
    (res.status as any)(400).json({
      success: false,
      message: "Email is required",
    });
    return;
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    (res.status as any)(400).json({
      success: false,
      message: "Invalid email format",
    });
    return;
  }

  next();
};

// OTP validation middleware
export const validateOTP = (req: Request, res: Response, next: any): void => {
  const { otp } = req.body as unknown as { otp: string };

  if (!otp) {
    (res.status as any)(400).json({
      success: false,
      message: "OTP is required",
    });
    return;
  }

  if (otp.length < 4 || otp.length > 10) {
    (res.status as any)(400).json({
      success: false,
      message: "OTP must be between 4 and 10 characters",
    });
    return;
  }

  next();
};

// Reply message validation middleware
export const validateReplyMessage = (
  req: Request,
  res: Response,
  next: any
): void => {
  const { replyMessage } = req.body as unknown as { replyMessage: string };

  if (!replyMessage) {
    (res.status as any)(400).json({
      success: false,
      message: "Reply message is required",
    });
    return;
  }

  if (replyMessage.trim().length < 10) {
    (res.status as any)(400).json({
      success: false,
      message: "Reply message must be at least 10 characters long",
    });
    return;
  }

  next();
};

// Bulk email validation middleware
export const validateBulkEmail = (
  req: Request,
  res: Response,
  next: any
): void => {
  const { emails, type } = req.body as unknown as {
    emails: any[];
    type: string;
  };

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    (res.status as any)(400).json({
      success: false,
      message: "Emails array is required and cannot be empty",
    });
    return;
  }

  if (emails.length > 100) {
    (res.status as any)(400).json({
      success: false,
      message: "Bulk email limit is 100 emails per request",
    });
    return;
  }

  if (!type) {
    (res.status as any)(400).json({
      success: false,
      message: "Email type is required",
    });
    return;
  }

  const validTypes = [
    "verification",
    "contact-received",
    "newsletter",
    "joinus-received",
    "joinus-approved",
    "joinus-rejected",
    "contact-reply",
  ];

  if (!validTypes.includes(type)) {
    (res.status as any)(400).json({
      success: false,
      message: `Invalid email type. Valid types: ${validTypes.join(", ")}`,
    });
    return;
  }

  // Validate each email in the array
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (let i = 0; i < emails.length; i++) {
    const emailData = emails[i];
    if (!emailData.email || !emailRegex.test(emailData.email)) {
      (res.status as any)(400).json({
        success: false,
        message: `Invalid or missing email at index ${i}`,
      });
      return;
    }

    // Type-specific validations
    if (type === "verification" && !emailData.otp) {
      (res.status as any)(400).json({
        success: false,
        message: `OTP is required for verification emails at index ${i}`,
      });
      return;
    }

    if (type === "contact-reply" && !emailData.replyMessage) {
      (res.status as any)(400).json({
        success: false,
        message: `Reply message is required for contact reply emails at index ${i}`,
      });
      return;
    }
  }

  next();
};

// Rate limiting middleware (basic implementation)
const emailAttempts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (
  maxAttempts: number = 10,
  windowMs: number = 15 * 60 * 1000
) => {
  return (req: Request, res: Response, next: any): void => {
    const clientIP =
      (req as any).ip || (req as any).connection?.remoteAddress || "unknown";
    const now = Date.now();

    if (!emailAttempts.has(clientIP)) {
      emailAttempts.set(clientIP, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    const attempts = emailAttempts.get(clientIP)!;

    if (now > attempts.resetTime) {
      // Reset the counter
      emailAttempts.set(clientIP, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (attempts.count >= maxAttempts) {
      (res.status as any)(429).json({
        success: false,
        message: "Too many email requests. Please try again later.",
        retryAfter: Math.ceil((attempts.resetTime - now) / 1000),
      });
      return;
    }

    attempts.count++;
    next();
  };
};
