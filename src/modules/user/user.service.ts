import { prisma } from "../../lib/prisma";

const listUser = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const getUserByid = async () => {};

const updateUser = async () => {};

export const UserServices = {
  listUser,
  getUserByid,
  updateUser,
};
