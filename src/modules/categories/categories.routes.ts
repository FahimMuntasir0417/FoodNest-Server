import { Router } from "express";
import auth from "../../middlewares/auth"; // adjust path if needed
import { CategoriesController } from "./categories.controller";
import { UserRole } from "../../types/user-role";

const router = Router();

// Public: list categories
// /api/categories
router.get("/", CategoriesController.list);

// Admin: create category
// /api/categories
router.post(
  "/",
  auth(UserRole.PROVIDER, UserRole.ADMIN),
  CategoriesController.create,
);

// Admin:  category by id
// /api/categories/id
router.get("/:id", CategoriesController.getById);

// Admin: update category
//  /api/categories/:id
router.patch("/:id", auth(UserRole.ADMIN), CategoriesController.update);

// Admin: delete category
// /api/categories/:id
router.delete("/:id", auth(UserRole.ADMIN), CategoriesController.remove);

export const categoriesRouter: Router = router;
