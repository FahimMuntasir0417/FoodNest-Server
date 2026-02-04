import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth"; // adjust path if needed
import { MealsController } from "./meals.controller";

const router = Router();

// Public: list meals (filters)
router.get("/", MealsController.list);

// Public: meal details
router.get("/:id", MealsController.details);

// Provider/Admin: create meal
router.post(
  "/",
  auth(UserRole.PROVIDER, UserRole.ADMIN, UserRole.CUSTOMER),
  MealsController.create,
);

// Provider/Admin: update my meal
router.patch(
  "/:id",
  auth(UserRole.PROVIDER, UserRole.ADMIN),
  MealsController.update,
);

// Provider/Admin: delete meal
router.delete(
  "/:id",
  auth(UserRole.PROVIDER, UserRole.ADMIN, UserRole.CUSTOMER),
  MealsController.remove,
);

export const mealsRouter: Router = router;
