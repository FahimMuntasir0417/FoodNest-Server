import { Request, Response, NextFunction } from "express";
import { auth as betterAuth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
  PROVIDER = "PROVIDER",
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        emailVerified: boolean;
        providerId?: string | null;
      };
    }
  }
}

// const auth = (...roles: UserRole[]) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // get user session
//       const session = await betterAuth.api.getSession({
//         headers: req.headers as any,
//       });

//       console.log("AUTH CHECK:", {
//         ok: !!session,
//         role: session?.user?.role,
//         emailVerified: session?.user?.emailVerified,
//       });

//       if (!session) {
//         return res.status(401).json({
//           success: false,
//           message: "You are not authorized!",
//         });
//       }

//       if (!session.user.emailVerified) {
//         return res.status(403).json({
//           success: false,
//           message: "Email verification required. Please verfiy your email!",
//         });
//       }

//       req.user = {
//         id: session.user.id,
//         email: session.user.email,
//         name: session.user.name,
//         role: session.user.role as string,
//         emailVerified: session.user.emailVerified,
//       };

//       if (roles.length && !roles.includes(req.user.role as UserRole)) {
//         return res.status(403).json({
//           success: false,
//           message:
//             "Forbidden! You don't have permission to access this resources!",
//         });
//       }

//       next();
//     } catch (err) {
//       next(err);
//     }
//   };
// };

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await betterAuth.api.getSession({
        headers: req.headers as any,
      });

      console.log("AUTH CHECK:", {
        ok: !!session,
        role: session?.user?.role,
        emailVerified: session?.user?.emailVerified,
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
          message: "Email verification required. Please verfiy your email!",
        });
      }

      // ✅ fetch providerId if providerProfile exists
      const providerProfile = await prisma.providerProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as string,
        emailVerified: session.user.emailVerified,
        providerId: providerProfile?.id ?? null, // ✅ attach
      };

      if (roles.length && !roles.includes(req.user.role as UserRole)) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden! You don't have permission to access this resources!",
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
export default auth;
