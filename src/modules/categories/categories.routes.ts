import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth"; // adjust path if needed
import { CategoriesController } from "./categories.controller";

const router = Router();

// Public: list categories
// /api/categories
router.get("/", CategoriesController.list);

// Admin: create category
// /api/categories
router.post("/", auth(UserRole.PROVIDER), CategoriesController.create);

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
