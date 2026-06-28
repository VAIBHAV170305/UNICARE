import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default_fallback_key_for_development_32_chars";
const ALGORITHM = "aes-256-cbc";

// Derive a 32-byte key from the configured encryption key
const getKey = (): Buffer => {
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
};

/**
 * Encrypts a plaintext string using AES-256-CBC.
 * Returns the format `iv:ciphertext` in hex.
 */
export function encrypt(text: string | null | undefined): string {
  if (!text) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts an encrypted hex string of format `iv:ciphertext` using AES-256-CBC.
 * If the input is not encrypted or decryption fails, returns the input string as-is (for compatibility).
 */
export function decrypt(hash: string | null | undefined): string {
  if (!hash) return "";
  try {
    const parts = hash.split(":");
    if (parts.length !== 2) return hash; // If format doesn't match, return raw input
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = Buffer.from(parts[1], "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
  } catch (error) {
    console.warn("Decryption failed, returning raw string:", error);
    return hash;
  }
}
