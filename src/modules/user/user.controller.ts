import { Request, Response, NextFunction } from "express";
import { UserServices } from "./user.service";
import { Role } from "../../../generated/prisma";

const userList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserServices.listUser();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// ✅ ADMIN: get user by id (includes providerId)
const getUserAdminByid = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const user = await UserServices.getUserWithProviderId(id as string);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// ✅ ME: get current user (includes providerId)
const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const me = await UserServices.getUserWithProviderId(req.user.id);

    if (!me) return res.status(404).json({ message: "User not found" });

    res.json(me);
  } catch (err) {
    next(err);
  }
};

// ✅ update role
const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const idRaw = req.params.id as unknown;
    if (typeof idRaw !== "string" || !idRaw.trim()) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const id = idRaw;

    const { role } = req.body as { role?: Role };
    if (!role) return res.status(400).json({ message: "role is required" });

    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Allowed: ${Object.values(Role).join(", ")}`,
      });
    }

    const updated = await UserServices.updateUserRole(id, role);

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.json(updated);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const deleted = await UserServices.deleteUser(id as string);

    if (!deleted) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "User deleted", user: deleted });
  } catch (err) {
    next(err);
  }
};

export const UserController = {
  userList,
  getMe, // ✅ new
  getUserAdminByid,
  updateUserRole,
  deleteUser,
};
