import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

// JWT implementation with RS256 signing
// This provides cryptographically secure tokens compared to base64 encoding

interface JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "homeowner" | "worker";
  iat?: number; // Issued at
  exp?: number; // Expiration
}

class JWTService {
  private privateKey: string;
  private publicKey: string;

  constructor() {
    // Generate or load RSA key pair
    // In production, these should be loaded from secure environment variables or key management service
    this.initializeKeys();
  }

  private initializeKeys() {
    const keysDir = path.join(process.cwd(), ".keys");
    const privateKeyPath = path.join(keysDir, "jwt-private.pem");
    const publicKeyPath = path.join(keysDir, "jwt-public.pem");

    try {
      // Try to load existing keys
      if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
        this.privateKey = fs.readFileSync(privateKeyPath, "utf8");
        this.publicKey = fs.readFileSync(publicKeyPath, "utf8");
        console.log("JWT keys loaded successfully");
        return;
      }
    } catch (error) {
      console.warn("Could not load existing JWT keys, generating new ones");
    }

    // Generate new RSA key pair
    console.log("Generating new RSA key pair for JWT...");
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    this.privateKey = privateKey;
    this.publicKey = publicKey;

    // Save keys to files for persistence
    try {
      if (!fs.existsSync(keysDir)) {
        fs.mkdirSync(keysDir, { recursive: true });
      }
      fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 }); // Read/write for owner only
      fs.writeFileSync(publicKeyPath, publicKey, { mode: 0o644 });
      console.log("JWT keys generated and saved successfully");
    } catch (error) {
      console.error("Failed to save JWT keys:", error);
      // Continue anyway - keys will work in memory for this session
    }
  }

  // Base64 URL-safe encoding
  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  // Base64 URL-safe decoding
  private base64UrlDecode(str: string): string {
    // Add padding back
    const padding = "=".repeat((4 - (str.length % 4)) % 4);
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/") + padding;
    return Buffer.from(base64, "base64").toString("utf8");
  }

  // Create JWT token
  public createToken(payload: JWTPayload, expiresIn: number = 24 * 60 * 60): string {
    const now = Math.floor(Date.now() / 1000);

    // Add issued at and expiration
    const fullPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn, // Default: 24 hours
    };

    // Create header
    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    // Encode header and payload
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));

    // Create signature
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto.createSign("RSA-SHA256");
    signature.update(signatureInput);
    signature.end();

    const signatureBytes = signature.sign(this.privateKey);
    const encodedSignature = this.base64UrlEncode(signatureBytes.toString("base64"));

    // Return complete JWT
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  }

  // Verify and decode JWT token
  public verifyToken(token: string): JWTPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("Invalid JWT format");
        return null;
      }

      const [encodedHeader, encodedPayload, encodedSignature] = parts;

      // Verify signature
      const signatureInput = `${encodedHeader}.${encodedPayload}`;
      const signature = Buffer.from(this.base64UrlDecode(encodedSignature), "base64");

      const verifier = crypto.createVerify("RSA-SHA256");
      verifier.update(signatureInput);
      verifier.end();

      const isValid = verifier.verify(this.publicKey, signature);

      if (!isValid) {
        console.error("Invalid JWT signature");
        return null;
      }

      // Decode payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as JWTPayload;

      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.error("JWT token expired");
        return null;
      }

      return payload;
    } catch (error) {
      console.error("JWT verification error:", error);
      return null;
    }
  }

  // Create refresh token (longer expiration)
  public createRefreshToken(payload: JWTPayload): string {
    return this.createToken(payload, 30 * 24 * 60 * 60); // 30 days
  }

  // Decode token without verification (for debugging)
  public decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(this.base64UrlDecode(parts[1])) as JWTPayload;
      return payload;
    } catch (error) {
      return null;
    }
  }
}

// Singleton instance
export const jwtService = new JWTService();
