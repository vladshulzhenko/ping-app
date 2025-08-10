import prisma from "./database";
import { config } from "./config";

// User role constants
export const UserRole = {
  ADMINISTRATOR: "ADMINISTRATOR",
  CLIENT: "CLIENT",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export class UserService {
  async createOrUpdateUser(
    chatId: string,
    userData: {
      username?: string;
      firstName?: string;
      lastName?: string;
    }
  ) {
    return await prisma.user.upsert({
      where: { chatId },
      update: {
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
      create: {
        chatId,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: UserRole.CLIENT,
      },
    });
  }

  async getUserByChatId(chatId: string) {
    return await prisma.user.findUnique({
      where: { chatId },
    });
  }

  async createAdminUser(chatId: string) {
    return await prisma.user.upsert({
      where: { chatId },
      update: { role: UserRole.ADMINISTRATOR },
      create: {
        chatId,
        role: UserRole.ADMINISTRATOR,
      },
    });
  }

  async getAllAdmins() {
    return await prisma.user.findMany({
      where: { role: UserRole.ADMINISTRATOR },
    });
  }

  async getAllUsers(page: number = 1, limit: number = config.paginationLimit) {
    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: { role: UserRole.CLIENT },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: { role: UserRole.CLIENT } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      users,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async getUserStats() {
    const [totalUsers, adminCount, clientCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.ADMINISTRATOR } }),
      prisma.user.count({ where: { role: UserRole.CLIENT } }),
    ]);

    return {
      totalUsers,
      adminCount,
      clientCount,
    };
  }
}
