import dotenv from "dotenv";
import { UserService } from "./userService";
import prisma from "./database";

// Load environment variables
dotenv.config();

const userService = new UserService();

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Get admin chat IDs from environment
    const adminChatIds =
      process.env.ADMIN_CHAT_IDS?.split(",").map((id) => id.trim()) || [];

    if (adminChatIds.length === 0) {
      console.warn(
        "⚠️ No admin chat IDs configured in ADMIN_CHAT_IDS environment variable."
      );
      console.log(
        "💡 Add chat IDs to .env file: ADMIN_CHAT_IDS=123456789,987654321"
      );
      return;
    }

    // Create admin users from config
    for (const chatId of adminChatIds) {
      await userService.createAdminUser(chatId);
      console.log(`✅ Created admin user with chat ID: ${chatId}`);
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    // Close database connection
    await prisma.$disconnect();
  }
}

seed();
