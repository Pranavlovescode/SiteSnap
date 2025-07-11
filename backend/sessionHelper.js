import jwt from "jsonwebtoken";

/**
 * Decodes the session token from NextAuth
 * Assumes NEXTAUTH_SECRET is the same as in your Next.js app
 * @param {string} sessionToken
 * @returns {object|null} Decoded session or null if invalid
 */
export async function getSession(sessionToken) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret) {
      throw new Error("NEXTAUTH_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(sessionToken, secret);

    return {
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      },
    };
  } catch (error) {
    console.error("Invalid or expired session token:", error.message);
    return null;
  }
}
