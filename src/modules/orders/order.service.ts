import { prisma } from "../../lib/prisma.js";

type AuthedUser = { id: string; role?: string };

const isAdmin = (u: AuthedUser) => u.role === "ADMIN";

type CreateOrderInput = {
  deliveryAddress: string;
  phone?: string;
  note?: string;
  deliveryFee?: number;
  itemIds: string[];
};

type UpdateOrderInput = {
  deliveryAddress?: string;
  phone?: string;
  note?: string;
};

type CreateFromDraftsInput = {
  deliveryAddress: string;
  phone?: string;
  note?: string;
  deliveryFee?: number;
};

const listAllAdmin = async () => {
  return prisma.order.findMany({
    include: {
      customer: true,
      items: {
        include: {
          meal: {
            include: {
              provider: true,
              category: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const createOrderWithItems = async (
  user: AuthedUser,
  data: CreateOrderInput,
) => {
  const df = typeof data.deliveryFee === "number" ? data.deliveryFee : 0;

  return prisma.$transaction(async (tx) => {
    // only my drafts
    const drafts = await tx.orderItem.findMany({
      where: {
        id: { in: data.itemIds },
        orderId: null,
        customerId: user.id,
      },
    });

    if (drafts.length !== data.itemIds.length) {
      throw new Error("Some items are missing, not yours, or already attached");
    }

    const subTotal = drafts.reduce((sum, it) => sum + it.lineTotal, 0);
    const total = subTotal + df;

    // ✅ exactOptionalPropertyTypes safe: only include optional fields if defined
    const orderData: {
      customerId: string;
      deliveryAddress: string;
      subTotal: number;
      deliveryFee: number;
      total: number;
      phone?: string;
      note?: string;
    } = {
      customerId: user.id,
      deliveryAddress: data.deliveryAddress,
      subTotal,
      deliveryFee: df,
      total,
    };

    if (data.phone !== undefined) orderData.phone = data.phone;
    if (data.note !== undefined) orderData.note = data.note;

    const order = await tx.order.create({ data: orderData });

    // attach items -> draft cleared
    await tx.orderItem.updateMany({
      where: { id: { in: data.itemIds } },
      data: { orderId: order.id },
    });

    return tx.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { meal: true } } },
    });
  });
};

const createFromDrafts = async (
  user: AuthedUser,
  data: CreateFromDraftsInput,
) => {
  const df = typeof data.deliveryFee === "number" ? data.deliveryFee : 0;

  return prisma.$transaction(async (tx) => {
    // ✅ get ALL my drafts
    const drafts = await tx.orderItem.findMany({
      where: {
        orderId: null,
        customerId: user.id,
      },
    });

    if (drafts.length === 0) {
      throw new Error("No draft items found");
    }

    const subTotal = drafts.reduce((sum, it) => sum + it.lineTotal, 0);
    const total = subTotal + df;

    // ✅ exactOptionalPropertyTypes safe
    const orderData: {
      customerId: string;
      deliveryAddress: string;
      subTotal: number;
      deliveryFee: number;
      total: number;
      phone?: string;
      note?: string;
    } = {
      customerId: user.id,
      deliveryAddress: data.deliveryAddress,
      subTotal,
      deliveryFee: df,
      total,
    };

    if (data.phone !== undefined) orderData.phone = data.phone;
    if (data.note !== undefined) orderData.note = data.note;

    const order = await tx.order.create({ data: orderData });

    // ✅ attach all drafts -> clears cart
    await tx.orderItem.updateMany({
      where: { id: { in: drafts.map((d) => d.id) } },
      data: { orderId: order.id },
    });

    return tx.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { meal: true } } },
    });
  });
};

const listMine = async (user: AuthedUser) => {
  if (isAdmin(user)) {
    return prisma.order.findMany({
      include: { items: { include: { meal: true } }, customer: true },
      orderBy: { createdAt: "desc" },
    });
  }

  if (user.role === "PROVIDER") {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!provider) return [];

    return prisma.order.findMany({
      where: { items: { some: { meal: { providerId: provider.id } } } },
      include: { items: { include: { meal: true } }, customer: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // customer
  return prisma.order.findMany({
    where: { customerId: user.id },
    include: { items: { include: { meal: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (user: AuthedUser, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { meal: true } }, customer: true },
  });
  if (!order) return null;

  if (isAdmin(user)) return order;

  if (user.role === "PROVIDER") {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!provider) return null;

    const involved = order.items.some(
      (it) => it.meal.providerId === provider.id,
    );
    return involved ? order : null;
  }

  // customer
  return order.customerId === user.id ? order : null;
};

const updateOrder = async (
  user: AuthedUser,
  orderId: string,
  data: UpdateOrderInput,
) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;

  if (!isAdmin(user) && order.customerId !== user.id) return null;

  if (order.status === "DELIVERED")
    throw new Error("Cannot update a DELIVERED order");

  // ✅ only include fields that are defined
  const updateData: {
    deliveryAddress?: string;
    phone?: string;
    note?: string;
  } = {};
  if (data.deliveryAddress !== undefined)
    updateData.deliveryAddress = data.deliveryAddress;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.note !== undefined) updateData.note = data.note;

  return prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: { items: { include: { meal: true } } },
  });
};

const updateStatus = async (
  user: AuthedUser,
  orderId: string,
  status: string,
) => {
  if (isAdmin(user)) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: { items: { include: { meal: true } } },
    });
  }

  const provider = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
  });
  if (!provider) return null;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { meal: true } } },
  });
  if (!order) return null;

  const involved = order.items.some((it) => it.meal.providerId === provider.id);
  if (!involved) return null;

  return prisma.order.update({
    where: { id: orderId },
    data: { status: status as any },
    include: { items: { include: { meal: true } } },
  });
};

const cancel = async (user: AuthedUser, orderId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;

  if (!isAdmin(user) && order.customerId !== user.id) return null;

  if (order.status === "DELIVERED")
    throw new Error("Cannot cancel a DELIVERED order");

  return prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
    include: { items: { include: { meal: true } } },
  });
};

const remove = async (user: AuthedUser, orderId: string) => {
  if (!isAdmin(user)) return false;

  const exists = await prisma.order.findUnique({ where: { id: orderId } });
  if (!exists) return false;

  await prisma.order.delete({ where: { id: orderId } });
  return true;
};

export const OrdersService = {
  createOrderWithItems,
  createFromDrafts,
  listMine,
  getById,
  updateOrder,
  updateStatus,
  cancel,
  remove,
  listAllAdmin,
};
