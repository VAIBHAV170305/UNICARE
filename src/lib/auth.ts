import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "default_local_jwt_secret_key_64_chars_unicare";
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export interface DecodedToken {
  uid: string;
  email: string;
  role: string;
}

/**
 * Signs a local JWT token using HMAC-SHA256 for local dev fallback.
 */
export function signLocalToken(payload: any, expiresIn: number = 86400): string {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresIn;
  const fullPayload = { ...payload, exp };

  const base64UrlHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64UrlPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

  const signatureInput = `${base64UrlHeader}.${base64UrlPayload}`;
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(signatureInput)
    .digest("base64url");

  return `${signatureInput}.${signature}`;
}

/**
 * Verifies a local JWT token using HMAC-SHA256.
 */
export function verifyLocalToken(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signature] = parts;
    const signatureInput = `${headerB64}.${payloadB64}`;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(signatureInput)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return {
      uid: payload.uid || payload.sub,
      email: payload.email || "",
      role: payload.role || "USER",
    };
  } catch (e) {
    return null;
  }
}

/**
 * Decodes a JWT payload without verifying its signature.
 */
export function decodeJwtWithoutVerification(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch (e) {
    return null;
  }
}

/**
 * Authenticates requests using either Firebase ID Tokens or locally signed fallback JWTs.
 */
export async function verifyAuthToken(request: Request): Promise<DecodedToken | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.substring(7);

    // Firebase Verification Mode
    if (FIREBASE_PROJECT_ID) {
      const decoded = decodeJwtWithoutVerification(token);
      if (!decoded) return null;

      const expectedIss = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
      if (decoded.iss !== expectedIss || decoded.aud !== FIREBASE_PROJECT_ID) {
        console.warn("Security warning: Invalid Firebase token issuer or audience");
        return null;
      }

      if (decoded.exp && Date.now() / 1000 > decoded.exp) {
        console.warn("Security warning: Firebase token has expired");
        return null;
      }

      return {
        uid: decoded.user_id || decoded.sub,
        email: decoded.email || "",
        role: decoded.role || "USER",
      };
    }

    // Local Fallback Verification Mode
    return verifyLocalToken(token);
  } catch (err) {
    console.error("Authentication check failed:", err);
    return null;
  }
}
