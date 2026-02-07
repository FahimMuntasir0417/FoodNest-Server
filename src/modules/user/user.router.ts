import express, { Router } from "express";
import { UserController } from "./user.controller.js";
import auth from "../../middlewares/auth.js";
import { UserRole } from "../../types/user-role.js";

const router = express.Router();

// Admin: listUser
router.get("/", auth(UserRole.ADMIN), UserController.userList);

// user me (✅ will include providerId now)
router.get("/me", auth(), UserController.getMe);

// get user by id (admin) (✅ can include providerId now)
router.get("/:id", auth(), UserController.getUserAdminByid);

// Admin: update user role
router.patch("/:id", auth(UserRole.ADMIN), UserController.updateUserRole);

// Admin: delete user
router.delete("/:id", auth(UserRole.ADMIN), UserController.deleteUser);

export const useRouter: Router = router;
