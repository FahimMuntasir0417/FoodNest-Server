import type { Request, Response, NextFunction } from "express";
import { auth as betterAuth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { UserRole } from "../types/user-role.js";

const isUserRole = (v: any): v is UserRole =>
  v === UserRole.ADMIN || v === UserRole.PROVIDER || v === UserRole.CUSTOMER;

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await betterAuth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!",
        });
      }

      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email verification required. Please verify your email!",
        });
      }

      // ✅ Load role from DB (source of truth)
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      const role: UserRole = isUserRole(dbUser?.role)
        ? dbUser!.role
        : UserRole.CUSTOMER; // ✅ enum value (not "CUSTOMER")

      // ✅ fetch providerId if providerProfile exists
      const providerProfile = await prisma.providerProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role,
        emailVerified: session.user.emailVerified,
        providerId: providerProfile?.id ?? null,
      };

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden! You don't have permission to access this resource!",
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
