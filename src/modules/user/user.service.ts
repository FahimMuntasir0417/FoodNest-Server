import { prisma } from "../../lib/prisma";

const listUser = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const getUserByid = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

const updateUser = async () => {
  // keep empty
};

export const UserServices = {
  listUser,
  getUserByid,
  updateUser,
};
