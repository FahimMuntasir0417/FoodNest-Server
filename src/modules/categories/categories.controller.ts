import { Request, Response, NextFunction } from "express";
import { CategoriesService } from "./categories.service.js";

type CreateCategoryBody = {
  name?: string;
  slug?: string;
};

type UpdateCategoryBody = {
  name?: string;
  slug?: string;
};

type UpdateCategoryInput = { name?: string; slug?: string };

const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await CategoriesService.list();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await CategoriesService.getById(id as string);

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json(category);
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug } = req.body as CreateCategoryBody;

    // keep same minimal check like your JS
    if (!name || !slug) {
      return res.status(400).json({ message: "name and slug are required" });
    }

    const created = await CategoriesService.create({ name, slug });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// const update = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { id } = req.params;
//     const { name, slug } = req.body as UpdateCategoryBody;

//     const updated = await CategoriesService.update(id as string, { name, slug });
//     res.json(updated);
//   } catch (err) {
//     next(err);
//   }
// };

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "id param is required" });

    const { name, slug } = req.body as UpdateCategoryBody;

    const input: UpdateCategoryInput = {
      ...(name !== undefined ? { name } : {}),
      ...(slug !== undefined ? { slug } : {}),
    };

    const updated = await CategoriesService.update(id as string, input);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await CategoriesService.remove(id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const CategoriesController = {
  list,
  create,
  update,
  remove,
  getById,
};
