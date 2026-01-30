import { prisma } from "../../lib/prisma";

type CreateProviderInput = {
  userId: string;
  shopName: string;
  description?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
};

type UpdateProviderInput = {
  shopName?: string;
  description?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
};

const list = async () => {
  return prisma.providerProfile.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const details = async (id: string) => {
  return prisma.providerProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      meals: {
        where: { isAvailable: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

const getByUserId = async (userId: string) => {
  return prisma.providerProfile.findUnique({
    where: { userId },
  });
};

const create = async (data: CreateProviderInput) => {
  return prisma.providerProfile.create({ data });
};

const updateByUserId = async (userId: string, data: UpdateProviderInput) => {
  return prisma.providerProfile.update({
    where: { userId },
    data,
  });
};

export const ProvidersService = {
  list,
  details,
  getByUserId,
  create,
  updateByUserId,
};
