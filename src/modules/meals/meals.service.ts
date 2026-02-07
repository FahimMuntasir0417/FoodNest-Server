import { prisma } from "../../lib/prisma.js";

type ListMealsInput = {
  providerId?: string;
  categoryId?: string;
  cuisine?: string;
  available?: string; // "true" | "false"
  page?: number;
  limit?: number;
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

  const page = Math.max(1, Number(filters.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(filters.limit ?? 10)));
  const skip = (page - 1) * limit;

  const isAvailable =
    typeof available === "string" ? available === "true" : undefined;

  // ✅ args type can be undefined, so we use NonNullable
  type FindManyArgs = NonNullable<Parameters<typeof prisma.meal.findMany>[0]>;
  type WhereType = FindManyArgs["where"];

  const where: WhereType = {
    ...(providerId ? { providerId } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(cuisine ? { cuisine } : {}),
    ...(typeof isAvailable === "boolean" ? { isAvailable } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.meal.findMany({
      where,
      include: { provider: true, category: true, reviews: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.meal.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
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
