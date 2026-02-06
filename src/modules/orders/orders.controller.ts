import { Request, Response, NextFunction } from "express";
import { OrdersService } from "./order.service";

type CreateOrderBody = {
  deliveryAddress?: string;
  phone?: string;
  note?: string;
  deliveryFee?: number;
  itemIds?: string[];
};

type UpdateOrderBody = {
  deliveryAddress?: string;
  phone?: string;
  note?: string;
};

type UpdateStatusBody = {
  status?: string;
};

type CreateFromDraftsBody = {
  deliveryAddress?: string;
  phone?: string;
  note?: string;
  deliveryFee?: number;
};

const listAllAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    // auth middleware will ensure ADMIN, but double-check is ok
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const orders = await OrdersService.listAllAdmin();
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const createOrderWithItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { deliveryAddress, phone, note, deliveryFee, itemIds } =
      req.body as CreateOrderBody;

    if (!deliveryAddress) {
      return res.status(400).json({ message: "deliveryAddress is required" });
    }
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: "itemIds[] is required" });
    }

    // ✅ exactOptionalPropertyTypes safe: only include optionals if defined
    const payload: {
      deliveryAddress: string;
      itemIds: string[];
      phone?: string;
      note?: string;
      deliveryFee?: number;
    } = { deliveryAddress, itemIds };

    if (phone !== undefined) payload.phone = phone;
    if (note !== undefined) payload.note = note;
    if (deliveryFee !== undefined) payload.deliveryFee = deliveryFee;

    const order = await OrdersService.createOrderWithItems(req.user, payload);
    res.status(201).json(order);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err?.message || "Order creation failed" });
  }
};

const createFromDrafts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { deliveryAddress, phone, note, deliveryFee } =
      req.body as CreateFromDraftsBody;

    if (!deliveryAddress) {
      return res.status(400).json({ message: "deliveryAddress is required" });
    }

    // ✅ exactOptionalPropertyTypes safe
    const payload: {
      deliveryAddress: string;
      phone?: string;
      note?: string;
      deliveryFee?: number;
    } = { deliveryAddress };

    if (phone !== undefined) payload.phone = phone;
    if (note !== undefined) payload.note = note;
    if (deliveryFee !== undefined) payload.deliveryFee = deliveryFee;

    const order = await OrdersService.createFromDrafts(req.user, payload);
    res.status(201).json(order);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err?.message || "Order creation failed" });
  }
};

const listMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const orders = await OrdersService.listMine(req.user);
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ message: "id param is required" });

    const order = await OrdersService.getById(req.user, id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    next(err);
  }
};

const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ message: "id param is required" });

    const { deliveryAddress, phone, note } = req.body as UpdateOrderBody;

    // ✅ exactOptionalPropertyTypes safe
    const payload: { deliveryAddress?: string; phone?: string; note?: string } =
      {};
    if (deliveryAddress !== undefined)
      payload.deliveryAddress = deliveryAddress;
    if (phone !== undefined) payload.phone = phone;
    if (note !== undefined) payload.note = note;

    const updated = await OrdersService.updateOrder(req.user, id, payload);
    if (!updated) return res.status(403).json({ message: "Forbidden" });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ message: "id param is required" });

    const { status } = req.body as UpdateStatusBody;
    if (!status) return res.status(400).json({ message: "status is required" });

    // ✅ no OrderStatus import needed
    const updated = await OrdersService.updateStatus(
      req.user,
      id,
      status as any,
    );

    if (!updated) return res.status(403).json({ message: "Forbidden" });
    res.json(updated);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err?.message || "Status update failed" });
  }
};

const cancel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ message: "id param is required" });

    const updated = await OrdersService.cancel(req.user, id);
    if (!updated) return res.status(403).json({ message: "Forbidden" });

    res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ message: err?.message || "Cancel failed" });
  }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ message: "id param is required" });

    const ok = await OrdersService.remove(req.user, id);
    if (!ok) return res.status(404).json({ message: "Order not found" });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const OrdersController = {
  createOrderWithItems,
  listMine,
  getById,
  updateOrder,
  updateStatus,
  cancel,
  remove,
  createFromDrafts,
  listAllAdmin,
};
