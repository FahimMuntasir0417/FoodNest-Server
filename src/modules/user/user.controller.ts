import { Request, Response, NextFunction } from "express";
import { UserServices } from "./user.service";

const userList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserServices.listUser();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const getUserAdminByid = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const user = await UserServices.getUserByid(id as string);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

const getUserByid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const me = await UserServices.getUserByid(req.user.id);
    if (!me) return res.status(404).json({ message: "User not found" });

    res.json(me);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  // keep empty
  res.status(501).json({ message: "Not implemented" });
};

export const UserController = {
  userList,
  getUserByid,
  updateUser,
  getUserAdminByid,
};
