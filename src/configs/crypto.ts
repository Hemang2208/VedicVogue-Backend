import CryptoJS from "crypto-js";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.CRYPTO_SECRET;
if (!SECRET_KEY) {
  console.log("CRYPTO_SECRET environment variable is not set");
  throw new Error("CRYPTO_SECRET environment variable is not set");
}

export const decrypt = (encryptedText: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    if (!text) {
      console.log("Decryption failed - possibly wrong key");
      throw new Error("Decryption failed - possibly wrong key");
    }
    return text;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Decryption failed: " + (error as Error).message);
  }
};

export const encrypt = (decryptedText: string): string => {
  const encrypted = CryptoJS.AES.encrypt(decryptedText, SECRET_KEY);
  return encrypted.toString();
};

// import CryptoJS from "crypto-js";

// const SECRET_KEY = process.env.CRYPTO_SECRET;
// if (!SECRET_KEY) {
//   throw new Error("CRYPTO_SECRET environment variable is not set");
// }

// export const decrypt = async (encryptedText: string): Promise<string> => {
//   const decrypt = await CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
//   const text = await decrypt.toString(CryptoJS.enc.Utf8);
//   return text;
// };

// export const encrypt = async (decryptedText: string): Promise<string> => {
//   const encrypted = await CryptoJS.AES.encrypt(decryptedText, SECRET_KEY);
//   const text = await encrypted.toString();
//   return text;
// };
