import { Request, Response, NextFunction } from "express";
import { ProvidersService } from "./providers.service";
import { OrderStatus } from "../../../generated/prisma";

type ProviderBody = {
  shopName?: string;
  description?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
};

const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = await ProvidersService.list();
    res.json(providers);
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const orders = await ProvidersService.getProviderOrders(req.user.id);
    return res.json(orders);
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const idRaw = req.params.id as unknown;
    if (typeof idRaw !== "string" || !idRaw.trim()) {
      return res.status(400).json({ message: "Invalid order id" });
    }
    const orderId = idRaw;

    const { status } = req.body as { status?: OrderStatus };
    if (!status) return res.status(400).json({ message: "status is required" });

    if (!Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${Object.values(OrderStatus).join(", ")}`,
      });
    }

    const updated = await ProvidersService.updateOrderStatus(
      req.user.id,
      orderId,
      status,
    );

    if (!updated) {
      return res.status(404).json({
        message: "Order not found or you don't have access to this order",
      });
    }

    return res.json(updated);
  } catch (err) {
    next(err);
  }
};

const details = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id?: string };

    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    const provider = await ProvidersService.details(id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json(provider);
  } catch (err) {
    next(err);
  }
};

const createMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const exists = await ProvidersService.getByUserId(req.user.id);
    if (exists) {
      return res
        .status(409)
        .json({ message: "Provider profile already exists" });
    }

    const { shopName, description, address, phone, logoUrl } =
      req.body as ProviderBody;

    if (!shopName) {
      return res.status(400).json({ message: "shopName is required" });
    }

    const profile = await ProvidersService.create({
      userId: req.user.id,
      shopName,
      ...(description !== undefined ? { description } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(logoUrl !== undefined ? { logoUrl } : {}),
    });

    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updated = await ProvidersService.updateByUserId(
      req.user.id,
      req.body as ProviderBody,
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const ProvidersController = {
  list,
  details,
  createMe,
  updateMe,
  getOrders,
  updateOrderStatus,
};
