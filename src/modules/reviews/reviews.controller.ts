import { Request, Response, NextFunction } from "express";
import { ReviewsService } from "./reviews.service";

type CreateReviewBody = {
  mealId?: string;
  rating?: number;
  comment?: string;
};

type UpdateReviewBody = {
  rating?: number;
  comment?: string;
};

const listAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await ReviewsService.listAll();
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

const listByMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mealId } = req.params;
    const reviews = await ReviewsService.listByMeal(mealId as string);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mealId, rating, comment } = req.body as CreateReviewBody;

    if (!mealId || typeof rating !== "number") {
      return res
        .status(400)
        .json({ message: "mealId and numeric rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "rating must be between 1 and 5" });
    }
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const created = await ReviewsService.create({
      mealId,
      customerId: req.user.id,
      rating,
      ...(comment !== undefined ? { comment } : {}),
    });

    res.status(201).json(created);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res
        .status(409)
        .json({ message: "You already reviewed this meal" });
    }
    next(err);
  }
};

const requireParamString = (v: unknown, name: string): string => {
  if (typeof v === "string" && v.trim().length > 0) return v;

  // Mostly query params can be arrays; harmless to support here too
  if (Array.isArray(v) && typeof v[0] === "string" && v[0].trim().length > 0) {
    return v[0];
  }

  throw new Error(`${name} is required`);
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = requireParamString(req.params.id, "id");
    const { rating, comment } = req.body as UpdateReviewBody;

    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const review = await ReviewsService.getById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (req.user.role !== "ADMIN" && review.customerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (typeof rating === "number" && (rating < 1 || rating > 5)) {
      return res
        .status(400)
        .json({ message: "rating must be between 1 and 5" });
    }

    const updated = await ReviewsService.update(id, {
      ...(rating !== undefined ? { rating } : {}),
      ...(comment !== undefined ? { comment } : {}),
    });

    res.json(updated);
  } catch (err: any) {
    // if requireParamString throws
    if (err?.message === "id is required") {
      return res.status(400).json({ message: "id is required" });
    }
    next(err);
  }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const review = await ReviewsService.getById(id as string);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (req.user.role !== "ADMIN" && review.customerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await ReviewsService.remove(id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const ReviewsController = {
  listByMeal,
  create,
  update,
  remove,
  listAll,
};
