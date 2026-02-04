import { Request, Response, NextFunction } from "express";
import { MealsService } from "./meals.service";

type ListMealsQuery = {
  providerId?: string;
  categoryId?: string;
  cuisine?: string;
  available?: string;
  page?: number; // parsed number
  limit?: number;
};

type CreateMealBody = {
  categoryId?: string | null;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  cuisine?: string;
  isAvailable?: boolean;
};

type UpdateMealBody = {
  categoryId?: string | null;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  cuisine?: string;
  isAvailable?: boolean;
};

// export const list = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { providerId, categoryId, cuisine, available, page, limit } =
//       req.query as ListMealsQuery;

//     const pageNum = Math.max(1, Number(page ?? 1));
//     const limitNum = Math.min(100, Math.max(1, Number(limit ?? 10)));

//     const result = await MealsService.list({
//       providerId,
//       categoryId,
//       cuisine,
//       available,
//       page: pageNum,
//       limit: limitNum,
//     });

//     res.json(result);
//   } catch (err) {
//     next(err);
//   }
// };

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { providerId, categoryId, cuisine, available, page, limit } =
      req.query as ListMealsQuery;

    const pageNum = Math.max(1, Number(page ?? 1));
    const limitNum = Math.min(100, Math.max(1, Number(limit ?? 10)));

    type MealsListInput = Parameters<typeof MealsService.list>[0];

    const input: MealsListInput = {
      page: pageNum,
      limit: limitNum,
      ...(providerId !== undefined ? { providerId } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(cuisine !== undefined ? { cuisine } : {}),
      ...(available !== undefined ? { available } : {}),
    };

    const result = await MealsService.list(input);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const details = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mealId = req.params.id;
    const meal = await MealsService.details(mealId as string);

    if (!meal) return res.status(404).json({ message: "Meal not found" });
    res.json(meal);
  } catch (err) {
    next(err);
  }
};

// const create = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const {
//       categoryId,
//       title,
//       description,
//       price,
//       imageUrl,
//       cuisine,
//       isAvailable,
//     } = req.body as CreateMealBody;

//     if (!title || typeof price !== "number") {
//       return res
//         .status(400)
//         .json({ message: "title and numeric price are required" });
//     }
//     if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

//     // find provider profile for logged-in user
//     const providerProfile = await MealsService.getProviderProfileByUserId(
//       req.user.id,
//     );
//     if (!providerProfile) {
//       return res
//         .status(400)
//         .json({ message: "Provider profile not found for user" });
//     }

//     const created = await MealsService.create({
//       providerId: providerProfile.id,
//       categoryId: categoryId ?? null,
//       title,
//       description,
//       price,
//       imageUrl,
//       cuisine,
//       isAvailable: typeof isAvailable === "boolean" ? isAvailable : true,
//     });

//     res.status(201).json(created);
//   } catch (err) {
//     next(err);
//   }
// };

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      categoryId,
      title,
      description,
      price,
      imageUrl,
      cuisine,
      isAvailable,
    } = req.body as CreateMealBody;

    if (!title || typeof price !== "number") {
      return res
        .status(400)
        .json({ message: "title and numeric price are required" });
    }
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const providerProfile = await MealsService.getProviderProfileByUserId(
      req.user.id,
    );
    if (!providerProfile) {
      return res
        .status(400)
        .json({ message: "Provider profile not found for user" });
    }

    // infer input type from service to avoid missing CreateMealInput import
    type CreateInput = Parameters<typeof MealsService.create>[0];

    const input: CreateInput = {
      providerId: providerProfile.id,
      categoryId: categoryId ?? null,
      title,
      price,
      isAvailable: typeof isAvailable === "boolean" ? isAvailable : true,
      ...(description !== undefined ? { description } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(cuisine !== undefined ? { cuisine } : {}),
    };

    const created = await MealsService.create(input);

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// const update = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const {
//       categoryId,
//       title,
//       description,
//       price,
//       imageUrl,
//       cuisine,
//       isAvailable,
//     } = req.body as UpdateMealBody;

//     if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

//     const mealId = req.params.id;

//     const meal = await MealsService.getById(mealId as string);
//     if (!meal) return res.status(404).json({ message: "Meal not found" });

//     // ownership check (unless admin)
//     if (req.user.role !== "ADMIN") {
//       const providerProfile = await MealsService.getProviderProfileByUserId(
//         req.user.id,
//       );
//       if (!providerProfile || meal.providerId !== providerProfile.id) {
//         return res.status(403).json({ message: "Forbidden (not your meal)" });
//       }
//     }

//     const updated = await MealsService.update(mealId, {
//       categoryId: categoryId === undefined ? undefined : categoryId,
//       title,
//       description,
//       price,
//       imageUrl,
//       cuisine,
//       isAvailable,
//     });

//     res.json(updated);
//   } catch (err) {
//     next(err);
//   }
// };

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      categoryId,
      title,
      description,
      price,
      imageUrl,
      cuisine,
      isAvailable,
    } = req.body as UpdateMealBody;

    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const mealIdRaw = req.params.id;

    // Narrow mealId to a real string
    if (typeof mealIdRaw !== "string" || mealIdRaw.trim() === "") {
      return res.status(400).json({ message: "Invalid meal id" });
    }
    const mealId = mealIdRaw;

    const meal = await MealsService.getById(mealId);
    if (!meal) return res.status(404).json({ message: "Meal not found" });

    // ownership check (unless admin)
    if (req.user.role !== "ADMIN") {
      const providerProfile = await MealsService.getProviderProfileByUserId(
        req.user.id,
      );
      if (!providerProfile || meal.providerId !== providerProfile.id) {
        return res.status(403).json({ message: "Forbidden (not your meal)" });
      }
    }

    // infer update input type (avoids missing type imports)
    type UpdateInput = Parameters<typeof MealsService.update>[1];

    const updateInput: UpdateInput = {
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(price !== undefined ? { price } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(cuisine !== undefined ? { cuisine } : {}),
      ...(isAvailable !== undefined ? { isAvailable } : {}),
    };

    const updated = await MealsService.update(mealId, updateInput);

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const mealId = req.params.id;

    const meal = await MealsService.getById(mealId as string);
    if (!meal) return res.status(404).json({ message: "Meal not found" });

    // ownership check (unless admin)
    if (req.user.role !== "ADMIN") {
      const providerProfile = await MealsService.getProviderProfileByUserId(
        req.user.id,
      );
      if (!providerProfile || meal.providerId !== providerProfile.id) {
        return res.status(403).json({ message: "Forbidden (not your meal)" });
      }
    }

    await MealsService.remove(mealId as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const MealsController = {
  list,
  details,
  create,
  update,
  remove,
};
