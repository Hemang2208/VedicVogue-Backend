import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  public_id?: string;
  folder?: string;
  resource_type?: "image" | "video" | "raw" | "auto";
  transformation?: any[];
}

export const uploadFile = async (
  file: string,
  options: UploadOptions = {}
): Promise<any> => {
  try {
    if (options.folder === "profile-pictures") {
      options.transformation = [
        {
          // aspect_ratio: "4:3",
          // width: 400,
          crop: "fill",
          gravity: "face",
          quality: "auto",
        },
      ];
    }

    const result = await cloudinary.uploader.upload(file, options);
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export const deleteFile = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

export const getOptimizedUrl = (
  publicId: string,
  options: any = {}
): string => {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    ...options,
  });
};

export default cloudinary;
