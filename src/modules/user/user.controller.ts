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

const getUserByid = async () => {};
const updateUser = async () => {};

export const UserController = {
  userList,
  getUserByid,
  updateUser,
};
