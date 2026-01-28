import { prisma } from "../../lib/prisma"; // adjust path

type CreateReviewInput = {
  mealId: string;
  customerId: string;
  rating: number;
  comment?: string;
};

type UpdateReviewInput = {
  rating?: number;
  comment?: string;
};

const listByMeal = async (mealId: string) => {
  return prisma.review.findMany({
    where: { mealId },
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string) => {
  return prisma.review.findUnique({
    where: { id },
  });
};

const create = async (data: CreateReviewInput) => {
  return prisma.review.create({ data });
};

const update = async (id: string, data: UpdateReviewInput) => {
  return prisma.review.update({
    where: { id },
    data,
  });
};

const remove = async (id: string) => {
  return prisma.review.delete({
    where: { id },
  });
};

export const ReviewsService = {
  listByMeal,
  getById,
  create,
  update,
  remove,
};
