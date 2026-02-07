import type { UserRole } from "../middlewares/auth.js";
// OR better: move UserRole to src/types/user-role.ts and import from there

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        emailVerified: boolean;
        providerId?: string | null;
      };
    }
  }
}

export {};
