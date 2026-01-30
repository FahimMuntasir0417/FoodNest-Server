import { prisma } from "../../lib/prisma";

type ListMealsInput = {
  providerId?: string;
  categoryId?: string;
  cuisine?: string;
  available?: string; // "true" | "false"
};

type CreateMealInput = {
  providerId: string;
  categoryId: string | null;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  cuisine?: string;
  isAvailable: boolean;
};

type UpdateMealInput = {
  categoryId?: string | null;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  cuisine?: string;
  isAvailable?: boolean;
};

const list = async (filters: ListMealsInput) => {
  const { providerId, categoryId, cuisine, available } = filters;

  return prisma.meal.findMany({
    where: {
      providerId: providerId || undefined,
      categoryId: categoryId || undefined,
      cuisine: cuisine || undefined,
      isAvailable:
        typeof available === "string" ? available === "true" : undefined,
    },
    include: {
      provider: true,
      category: true,
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const details = async (id: string) => {
  return prisma.meal.findUnique({
    where: { id },
    include: {
      provider: true,
      category: true,
      reviews: { include: { customer: { select: { id: true, name: true } } } },
    },
  });
};

const getById = async (id: string) => {
  return prisma.meal.findUnique({ where: { id } });
};

const getProviderProfileByUserId = async (userId: string) => {
  return prisma.providerProfile.findUnique({
    where: { userId },
  });
};

const create = async (data: CreateMealInput) => {
  return prisma.meal.create({ data });
};

const update = async (id: string, data: UpdateMealInput) => {
  return prisma.meal.update({
    where: { id },
    data,
  });
};

const remove = async (id: string) => {
  return prisma.meal.delete({
    where: { id },
  });
};

export const MealsService = {
  list,
  details,
  getById,
  getProviderProfileByUserId,
  create,
  update,
  remove,
};
