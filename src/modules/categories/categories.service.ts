import { prisma } from "../../lib/prisma.js"; // adjust to your prisma export

type CreateCategoryInput = {
  name: string;
  slug: string;
};

type UpdateCategoryInput = {
  name?: string;
  slug?: string;
};

const list = async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

const getById = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
  });
};

const create = async (data: CreateCategoryInput) => {
  return prisma.category.create({ data });
};

const update = async (id: string, data: UpdateCategoryInput) => {
  return prisma.category.update({
    where: { id },
    data,
  });
};

const remove = async (id: string) => {
  return prisma.category.delete({
    where: { id },
  });
};

export const CategoriesService = {
  list,
  getById,
  create,
  update,
  remove,
};
