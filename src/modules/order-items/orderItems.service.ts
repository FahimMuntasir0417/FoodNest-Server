import { prisma } from "../../lib/prisma";

type AuthedUser = { id: string; role?: string };

const isAdmin = (u: AuthedUser) => u.role === "ADMIN";

// ✅ drafts for current user
const listMyDrafts = async (userId: string) => {
  return prisma.orderItem.findMany({
    where: { orderId: null, customerId: userId },
    include: { meal: true },
    orderBy: { id: "desc" },
  });
};

// ✅ list items under an order
// - ADMIN: allowed
// - CUSTOMER: only if owner of that order
// - PROVIDER: only if involved (order contains provider meals)
const listByOrder = async (user: AuthedUser, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { meal: true } } },
  });
  if (!order) return null;

  if (isAdmin(user)) return order.items;

  if (user.role === "CUSTOMER") {
    if (order.customerId !== user.id) return null;
    return order.items;
  }

  if (user.role === "PROVIDER") {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!provider) return null;

    const involved = order.items.some(
      (it) => it.meal.providerId === provider.id,
    );
    return involved ? order.items : null;
  }

  return null;
};

// ✅ get single item (owner/admin only)
const getById = async (user: AuthedUser, id: string) => {
  const item = await prisma.orderItem.findUnique({
    where: { id },
    include: { meal: true, order: true },
  });
  if (!item) return null;

  if (isAdmin(user)) return item;
  if (item.customerId !== user.id) return null;

  return item;
};

// ✅ create draft item
const createDraft = async (
  userId: string,
  { mealId, quantity }: { mealId: string; quantity?: number },
) => {
  const meal = await prisma.meal.findUnique({ where: { id: mealId } });
  if (!meal || !meal.isAvailable) throw new Error("Meal not available");

  const qty = Math.max(1, Number(quantity || 1));
  const unitPrice = meal.price;
  const lineTotal = unitPrice * qty;

  return prisma.orderItem.create({
    data: {
      orderId: null,
      customerId: userId,
      mealId,
      quantity: qty,
      unitPrice,
      lineTotal,
    },
    include: { meal: true },
  });
};

// ✅ update quantity + recalc lineTotal
// if item attached to an order => also recalc order subTotal/total
// (tx removed)
const update = async (
  user: AuthedUser,
  id: string,
  { quantity }: { quantity?: number },
) => {
  const item = await prisma.orderItem.findUnique({
    where: { id },
    include: { order: true },
  });
  if (!item) return null;

  if (!isAdmin(user) && item.customerId !== user.id) return null;

  const qty = Math.max(1, Number(quantity || item.quantity));
  const newLineTotal = item.unitPrice * qty;

  const updatedItem = await prisma.orderItem.update({
    where: { id },
    data: { quantity: qty, lineTotal: newLineTotal },
    include: { meal: true },
  });

  // If attached to an order -> recompute totals
  if (item.orderId) {
    const all = await prisma.orderItem.findMany({
      where: { orderId: item.orderId },
    });
    const subTotal = all.reduce((sum, it) => sum + it.lineTotal, 0);

    const order = await prisma.order.findUnique({
      where: { id: item.orderId },
    });
    if (order) {
      await prisma.order.update({
        where: { id: item.orderId },
        data: { subTotal, total: subTotal + order.deliveryFee },
      });
    }
  }

  return updatedItem;
};

// ✅ delete item
// if attached -> recompute order totals
// (tx removed)
const remove = async (user: AuthedUser, id: string) => {
  const item = await prisma.orderItem.findUnique({
    where: { id },
    include: { order: true },
  });
  if (!item) return false;

  if (!isAdmin(user) && item.customerId !== user.id) return false;

  await prisma.orderItem.delete({ where: { id } });

  if (item.orderId) {
    const all = await prisma.orderItem.findMany({
      where: { orderId: item.orderId },
    });
    const subTotal = all.reduce((sum, it) => sum + it.lineTotal, 0);

    const order = await prisma.order.findUnique({
      where: { id: item.orderId },
    });
    if (order) {
      await prisma.order.update({
        where: { id: item.orderId },
        data: { subTotal, total: subTotal + order.deliveryFee },
      });
    }
  }

  return true;
};

export const OrderItemsService = {
  listMyDrafts,
  listByOrder,
  getById,
  createDraft,
  update,
  remove,
};
