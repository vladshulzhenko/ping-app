import { UserService } from "./userService";
import prisma from "./database";
import { validateConfig } from "./config";

validateConfig();

const userService = new UserService();

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Get admin chat IDs from environment
    const adminChatIds =
      process.env.ADMIN_CHAT_IDS?.split(",").map((id) => id.trim()) || [];

    console.log(`👥 Creating ${adminChatIds.length} admin user(s)...`);

    // Create admin users from config
    for (const chatId of adminChatIds) {
      await userService.createAdminUser(chatId);
      console.log(`✅ Created admin user: ${chatId}`);
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
