import express, { Router } from "express";
import { UserController } from "./user.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

// Admin: listUser
router.get("/", auth(UserRole.ADMIN), UserController.userList);

// user me (✅ will include providerId now)
router.get("/me", auth(), UserController.getMe);

// get user by id (admin) (✅ can include providerId now)
router.get("/:id", auth(UserRole.ADMIN), UserController.getUserAdminByid);

// Admin: update user role
router.patch("/:id", auth(UserRole.ADMIN), UserController.updateUserRole);

// Admin: delete user
router.delete("/:id", auth(UserRole.ADMIN), UserController.deleteUser);

export const useRouter: Router = router;
