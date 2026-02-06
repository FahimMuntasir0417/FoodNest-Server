import { Router } from "express";
import auth from "../../middlewares/auth";
import { OrderItemsController } from "./orderItems.controller";
import { UserRole } from "../../types/user-role";

const router = Router();

/**
 * GET
 * - /draft/me       => my draft items (cart)
 * - /order/:orderId => items under an order (owner/admin/provider involved)
 * - /:id            => single item (owner/admin)
 */

// My drafts (cart)
router.get(
  "/",
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  OrderItemsController.listMyDrafts,
);

// Items of an order
router.get(
  "/order/:orderId",
  auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.PROVIDER),
  OrderItemsController.listByOrder,
);

// Single item
router.get(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.PROVIDER),
  OrderItemsController.getById,
);

/**
 * POST
 * - / => create draft order item
 */
router.post(
  "/",
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  OrderItemsController.createDraft,
);

/**
 * PATCH
 * - /:id => update quantity (recalc lineTotal, and if attached recalc order totals)
 */
router.patch(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  OrderItemsController.update,
);

/**
 * DELETE
 * - /:id => delete item (and if attached recalc order totals)
 */
router.delete(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  OrderItemsController.remove,
);

export const orderItemsRouter: Router = router;
