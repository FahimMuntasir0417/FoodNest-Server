import { Request, Response, NextFunction } from "express";
import { ProvidersService } from "./providers.service";

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

const details = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params;
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

    // ✅ shopName must exist because Prisma requires it
    if (!shopName) {
      return res.status(400).json({ message: "shopName is required" });
    }

    // ✅ now TypeScript knows shopName is string
    const profile = await ProvidersService.create({
      userId: req.user.id,
      shopName,
      description,
      address,
      phone,
      logoUrl,
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
};
