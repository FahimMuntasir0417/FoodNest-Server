import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { ProvidersController } from "./providers.controller";

const router = Router();

// ✅ Provider orders MUST come before "/:id"
router.get("/orders", auth(UserRole.PROVIDER), ProvidersController.getOrders);

router.patch(
  "/orders/:id",
  auth(UserRole.PROVIDER),
  ProvidersController.updateOrderStatus,
);

// Public: list providers
router.get("/", ProvidersController.list);

// Public: provider details (with meals)
router.get("/:id", ProvidersController.details);

// Provider/Admin/Customer: create my provider profile
router.post(
  "/",
  auth(UserRole.PROVIDER, UserRole.ADMIN, UserRole.CUSTOMER),
  ProvidersController.createMe,
);

// Provider/Admin: update my profile
router.patch(
  "/me",
  auth(UserRole.PROVIDER, UserRole.ADMIN),
  ProvidersController.updateMe,
);

export const providersRouter: Router = router;
