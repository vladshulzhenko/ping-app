import prisma from "./database";

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
}
