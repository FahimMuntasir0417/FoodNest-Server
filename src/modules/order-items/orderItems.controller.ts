import { Request, Response, NextFunction } from "express";
import { OrderItemsService } from "./orderItems.service.js";

type CreateBody = { mealId?: string; quantity?: number };
type UpdateBody = { quantity?: number };

const listMyDrafts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const items = await OrderItemsService.listMyDrafts(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

const listByOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { orderId } = req.params as { orderId: string }; // ✅ string
    const items = await OrderItemsService.listByOrder(req.user, orderId);

    if (!items) return res.status(403).json({ message: "Forbidden" });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params as { id: string }; // ✅ string
    const item = await OrderItemsService.getById(req.user, id);

    if (!item) return res.status(404).json({ message: "Order item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

const createDraft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { mealId, quantity } = req.body as CreateBody;
    if (!mealId) return res.status(400).json({ message: "mealId is required" });

    const payload: { mealId: string; quantity?: number } = { mealId };
    if (quantity !== undefined) payload.quantity = quantity;

    const created = await OrderItemsService.createDraft(req.user.id, payload);
    res.status(201).json(created);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err?.message || "Failed to create order item" });
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params as { id: string }; // ✅ string
    const { quantity } = req.body as UpdateBody;

    const payload: UpdateBody = {};
    if (quantity !== undefined) payload.quantity = quantity;

    const updated = await OrderItemsService.update(req.user, id, payload);
    if (!updated) return res.status(403).json({ message: "Forbidden" });

    res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ message: err?.message || "Update failed" });
  }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params as { id: string }; // ✅ string
    const ok = await OrderItemsService.remove(req.user, id);

    if (!ok) return res.status(403).json({ message: "Forbidden" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const OrderItemsController = {
  listMyDrafts,
  listByOrder,
  getById,
  createDraft,
  update,
  remove,
};
