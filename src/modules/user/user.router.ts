import express, { Router } from "express";
import { UserController } from "./user.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

// Admin: listUser
router.get("/", auth(UserRole.ADMIN), UserController.userList);

// user me
router.get("/me", auth(), UserController.getUserByid);

// get user by id (admin)
router.get("/:id", auth(UserRole.ADMIN), UserController.getUserAdminByid);

export const useRouter: Router = router;
