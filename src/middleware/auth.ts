// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { adminAuth } from "../lib/firebase-admin.ts";
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-maheshwari";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    phone?: string;
    name?: string;
    role: string;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token is required" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    let uid = "";
    let email = "";
    let phone = "";
    let name = "";

    // 1. Try custom JWT verification first (Mobile OTP flow)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      uid = decoded.uid;
      phone = decoded.phone || "";
      name = decoded.name || "";
      email = decoded.email || "";
    } catch (jwtErr) {
      // 2. If custom JWT fails, try Firebase Auth ID Token verification (Google Sign-In)
      const firebaseDecoded = await adminAuth.verifyIdToken(token);
      uid = firebaseDecoded.uid;
      email = firebaseDecoded.email || "";
      name = firebaseDecoded.name || "";
      phone = firebaseDecoded.phone_number || "";
    }

    if (!uid) {
      return res.status(401).json({ error: "Invalid or expired session token" });
    }

    // 3. Fetch user details from database in real-time to check role & blocked status
    const dbUserList = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    
    if (dbUserList.length === 0) {
      // Create user record dynamically if verified via Firebase but doesn't exist yet
      const [newUser] = await db.insert(users).values({
        uid,
        email: email || `${uid}@customer.com`,
        name: name || "Customer",
        phone: phone || null,
        role: "Customer",
        isBlocked: false,
      }).returning();
      
      req.user = {
        uid: newUser.uid,
        email: newUser.email,
        phone: newUser.phone || undefined,
        name: newUser.name || undefined,
        role: newUser.role,
      };
    } else {
      const dbUser = dbUserList[0];
      if (dbUser.isBlocked) {
        return res.status(403).json({ error: "Your account has been suspended. Please contact Maheshwari Sweets support." });
      }

      req.user = {
        uid: dbUser.uid,
        email: dbUser.email,
        phone: dbUser.phone || undefined,
        name: dbUser.name || undefined,
        role: dbUser.role,
      };
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Session expired or invalid token" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || (req.user.role !== "Super Admin" && req.user.role !== "Admin")) {
      return res.status(403).json({ error: "Access denied: Administrative privileges required" });
    }
    next();
  });
}
