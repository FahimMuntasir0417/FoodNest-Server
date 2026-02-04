import { Role } from "../../../generated/prisma";
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

const updateUserRole = async (id: string, role: Role) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return null;

  return prisma.user.update({
    where: { id },
    data: { role }, // ✅ correct
  });
};

const deleteUser = async (id: string) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return null;

  return prisma.user.delete({
    where: { id },
  });
};

export const UserServices = {
  listUser,
  getUserByid,
  updateUserRole,

  deleteUser,
};
