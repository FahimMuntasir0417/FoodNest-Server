import { Role } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";

const listUser = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
};

// ✅ user + providerId
const getUserWithProviderId = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      providerProfile: {
        select: { id: true }, // providerId
      },
    },
  });

  if (!user) return null;

  // return user object with providerId merged
  return {
    ...user,
    providerId: user.providerProfile?.id ?? null,
    providerProfile: undefined, // optional: hide providerProfile object
  };
};

const updateUserRole = async (id: string, role: Role) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return null;

  return prisma.user.update({
    where: { id },
    data: { role },
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
  getUserWithProviderId, // ✅ new
  updateUserRole,
  deleteUser,
};
