import mongoose from "mongoose";

export interface IIntern extends mongoose.Document {
  // Basic Information
  fullName: string;
  college: string;

  // Contact Information
  contactInfo: {
    email: string;
    phone: string;
  };

  // Professional Information
  information: {
    experience?: string;
    message: string;
  };

  // Links and Documents
  links: {
    resumeLink: string;
    linkedin: string;
    portfolioLink?: string;
  };

  // Additional Details
  additionalInfo?: {
    ip?: string;
    geo?: {
      country?: string;
      region?: string;
      city?: string;
      timezone?: string;
      isp?: string;
      org?: string;
      location?: {
        latitude?: number;
        longitude?: number;
      };
    };
    device?: {
      type?: string;
      brand?: string;
      model?: string;
      browser?: string;
      os?: string;
      memory?: number;
      cores?: number;
      connection?: {
        type?: string;
        speed?: number;
        latency?: number;
        dataSaver?: boolean;
      };
      battery?: {
        charging?: boolean;
        level?: number;
        chargingTime?: number;
        dischargingTime?: number;
      };
      permissions?: {
        notifications?: string;
        geolocation?: string;
        camera?: string;
        microphone?: string;
      };
      screen?: {
        width?: number;
        height?: number;
        colorDepth?: number;
        pixelDepth?: number;
        availWidth?: number;
        availHeight?: number;
      };
      viewport?: {
        width?: number;
        height?: number;
      };
    };
    browser?: {
      name?: string;
      version?: string;
      engine?: string;
      engineVersion?: string;
      vendor?: string;
      mobile?: boolean;
      tablet?: boolean;
      desktop?: boolean;
    };
    security?: {
      doNotTrack?: string;
      secureContext?: boolean;
      cookieEnabled?: boolean;
      javaEnabled?: boolean;
      onLine?: boolean;
      webdriver?: boolean;
      plugins?: string[];
      mimeTypes?: string[];
    };
    session?: {
      timestamp?: number;
      sessionId?: string;
      referrer?: string;
      currentUrl?: string;
      timeZone?: string;
      timeZoneOffset?: number;
      language?: string;
      languages?: string[];
      visitDuration?: number;
      pageLoadTime?: number;
    };
    headers?: {
      userAgent?: string;
      accept?: string;
      acceptLanguage?: string;
      acceptEncoding?: string;
      secChUa?: string;
      secChUaPlatform?: string;
      secChUaMobile?: string;
      secFetchSite?: string;
      secFetchMode?: string;
      secFetchDest?: string;
    };
    timestamp?: string;
  };

  // Legal Consent
  privacyConsent: boolean;
  ipAddress: string;
  isReplied?: boolean;
  isShortlisted?: boolean;
  isDeleted?: boolean;
}

const InternSchema = new mongoose.Schema(
  {
    // Basic Information
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },

    // Contact Information
    contactInfo: {
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // Professional Information
    information: {
      experience: {
        type: String,
        required: false,
        trim: true,
        default: "",
      },
      message: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // Links and Documents
    links: {
      resumeLink: {
        type: String,
        required: true,
        trim: true,
      },
      linkedin: {
        type: String,
        required: true,
        trim: true,
      },
      portfolioLink: {
        type: String,
        required: false,
        trim: true,
        default: "",
      },
    },

    // Additional Details
    additionalInfo: {
      ip: {
        type: String,
        default: "",
      },
      geo: {
        country: {
          type: String,
          default: "",
        },
        region: {
          type: String,
          default: "",
        },
        city: {
          type: String,
          default: "",
        },
        timezone: {
          type: String,
          default: "",
        },
        isp: {
          type: String,
          default: "",
        },
        org: {
          type: String,
          default: "",
        },
        location: {
          latitude: {
            type: Number,
            default: 0,
          },
          longitude: {
            type: Number,
            default: 0,
          },
        },
      },
      device: {
        type: {
          type: String,
          default: "",
        },
        brand: {
          type: String,
          default: "",
        },
        model: {
          type: String,
          default: "",
        },
        browser: {
          type: String,
          default: "",
        },
        os: {
          type: String,
          default: "",
        },
        memory: {
          type: Number,
          default: 0,
        },
        cores: {
          type: Number,
          default: 0,
        },
        connection: {
          type: {
            type: String,
            default: "",
          },
          speed: {
            type: Number,
            default: 0,
          },
          latency: {
            type: Number,
            default: 0,
          },
          dataSaver: {
            type: Boolean,
            default: false,
          },
        },
        battery: {
          charging: {
            type: Boolean,
            default: false,
          },
          level: {
            type: Number,
            default: 0,
          },
          chargingTime: {
            type: Number,
            default: 0,
          },
          dischargingTime: {
            type: Number,
            default: 0,
          },
        },
        permissions: {
          notifications: {
            type: String,
            default: "",
          },
          geolocation: {
            type: String,
            default: "",
          },
          camera: {
            type: String,
            default: "",
          },
          microphone: {
            type: String,
            default: "",
          },
        },
        screen: {
          width: {
            type: Number,
            default: 0,
          },
          height: {
            type: Number,
            default: 0,
          },
          colorDepth: {
            type: Number,
            default: 0,
          },
          pixelDepth: {
            type: Number,
            default: 0,
          },
          availWidth: {
            type: Number,
            default: 0,
          },
          availHeight: {
            type: Number,
            default: 0,
          },
        },
        viewport: {
          width: {
            type: Number,
            default: 0,
          },
          height: {
            type: Number,
            default: 0,
          },
        },
      },
      browser: {
        name: {
          type: String,
          default: "",
        },
        version: {
          type: String,
          default: "",
        },
        engine: {
          type: String,
          default: "",
        },
        engineVersion: {
          type: String,
          default: "",
        },
        vendor: {
          type: String,
          default: "",
        },
        mobile: {
          type: Boolean,
          default: false,
        },
        tablet: {
          type: Boolean,
          default: false,
        },
        desktop: {
          type: Boolean,
          default: false,
        },
      },
      security: {
        doNotTrack: {
          type: String,
          default: "",
        },
        secureContext: {
          type: Boolean,
          default: false,
        },
        cookieEnabled: {
          type: Boolean,
          default: false,
        },
        javaEnabled: {
          type: Boolean,
          default: false,
        },
        onLine: {
          type: Boolean,
          default: false,
        },
        webdriver: {
          type: Boolean,
          default: false,
        },
        plugins: [
          {
            type: String,
          },
        ],
        mimeTypes: [
          {
            type: String,
          },
        ],
      },
      session: {
        timestamp: {
          type: Number,
          default: 0,
        },
        sessionId: {
          type: String,
          default: "",
        },
        referrer: {
          type: String,
          default: "",
        },
        currentUrl: {
          type: String,
          default: "",
        },
        timeZone: {
          type: String,
          default: "",
        },
        timeZoneOffset: {
          type: Number,
          default: 0,
        },
        language: {
          type: String,
          default: "",
        },
        languages: [
          {
            type: String,
          },
        ],
        visitDuration: {
          type: Number,
          default: 0,
        },
        pageLoadTime: {
          type: Number,
          default: 0,
        },
      },
      headers: {
        userAgent: {
          type: String,
          default: "",
        },
        accept: {
          type: String,
          default: "",
        },
        acceptLanguage: {
          type: String,
          default: "",
        },
        acceptEncoding: {
          type: String,
          default: "",
        },
        secChUa: {
          type: String,
          default: "",
        },
        secChUaPlatform: {
          type: String,
          default: "",
        },
        secChUaMobile: {
          type: String,
          default: "",
        },
        secFetchSite: {
          type: String,
          default: "",
        },
        secFetchMode: {
          type: String,
          default: "",
        },
        secFetchDest: {
          type: String,
          default: "",
        },
      },
      timestamp: {
        type: String,
        default: "",
      },
    },

    // Legal Consent
    privacyConsent: {
      type: Boolean,
      required: true,
    },
    ipAddress: {
      type: String,
      required: false,
      trim: true,
      default: "UNKNOWN",
    },
    isReplied: {
      type: Boolean,
      default: false,
    },
    isShortlisted: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const InternModel = mongoose.model("Intern", InternSchema);

export default InternModel;
