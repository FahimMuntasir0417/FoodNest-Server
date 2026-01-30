import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { OrdersController } from "./orders.controller";

const router = Router();

/**
 * CREATE
 * Create order and attach draft items (itemIds)
 */
router.post(
  "/",
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  OrdersController.createOrderWithItems,
);

router.post(
  "/from-drafts",
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  OrdersController.createFromDrafts,
);

/**
 * READ
 */
router.get(
  "/me",
  auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.PROVIDER),
  OrdersController.listMine,
);

router.get(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.PROVIDER),
  OrdersController.getById,
);

/**
 * UPDATE (customer/admin)
 * deliveryAddress/phone/note
 */
router.patch(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  OrdersController.updateOrder,
);

/**
 * UPDATE STATUS (admin/provider-involved)
 */
router.patch(
  "/:id/status",
  auth(UserRole.ADMIN, UserRole.PROVIDER),
  OrdersController.updateStatus,
);

/**
 * CANCEL (customer/admin)
 */
router.patch(
  "/:id/cancel",
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  OrdersController.cancel,
);

/**
 * DELETE (admin only)
 */
router.delete("/:id", auth(UserRole.ADMIN), OrdersController.remove);

export const ordersRouter: Router = router;
