import express, { Router } from "express";
import { UserController } from "./user.controller";

import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();
// Admin: listexusers
router.get("/", auth(UserRole.ADMIN), UserController.userList);

export const useRouter: Router = router;
