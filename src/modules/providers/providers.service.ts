import { OrderStatus } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";

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

const getProviderOrders = async (userId: string) => {
  // 1) providerId from ProviderProfile
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!provider) return []; // provider profile missing

  // 2) orders that contain this provider's meals
  return prisma.order.findMany({
    where: {
      items: {
        some: {
          meal: { providerId: provider.id },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      items: {
        include: {
          meal: {
            select: { id: true, title: true, price: true, providerId: true },
          },
        },
      },
    },
  });
};

const updateOrderStatus = async (
  userId: string,
  orderId: string,
  status: OrderStatus,
) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!provider) return null;

  // ensure this order has at least one item from this provider
  const allowed = await prisma.order.findFirst({
    where: {
      id: orderId,
      items: {
        some: {
          meal: { providerId: provider.id },
        },
      },
    },
    select: { id: true },
  });

  if (!allowed) return null;

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      items: {
        include: {
          meal: {
            select: { id: true, title: true, price: true, providerId: true },
          },
        },
      },
    },
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
  getProviderOrders,
  updateOrderStatus,
};
