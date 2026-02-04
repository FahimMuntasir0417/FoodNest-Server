import express, { Router } from "express";
import { UserController } from "./user.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

// Admin: listUser
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.CUSTOMER),
  UserController.userList,
);

// user me
router.get("/me", auth(), UserController.getUserByid);

// get user by id (admin)
router.get("/:id", auth(UserRole.ADMIN), UserController.getUserAdminByid);

// ✅ Admin: update user status
router.patch("/:id", auth(UserRole.ADMIN), UserController.updateUserRole);

// ✅ Admin: delete user
router.delete("/:id", auth(UserRole.ADMIN), UserController.deleteUser);

export const useRouter: Router = router;
