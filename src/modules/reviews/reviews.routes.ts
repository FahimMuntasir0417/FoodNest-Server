import { Router } from "express";
import auth from "../../middlewares/auth"; // adjust path
import { ReviewsController } from "./reviews.controller";
import { UserRole } from "../../types/user-role";

const router = Router();

// Admin: list all reviews
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.PROVIDER),

  ReviewsController.listAll,
);

// Public: list reviews for a meal
router.get(
  "/meal/:mealId",
  auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.PROVIDER),
  ReviewsController.listByMeal,
);

// Customer/Admin: create review
router.post(
  "/",
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  ReviewsController.create,
);

// Customer/Admin: update review
router.patch(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  ReviewsController.update,
);

// Customer/Admin: delete review
router.delete(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  ReviewsController.remove,
);

export const reviewsRouter: Router = router;
