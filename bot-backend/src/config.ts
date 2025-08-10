import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN!,
  miniAppUrl: process.env.MINI_APP_URL!,
  adminChatIds:
    process.env.ADMIN_CHAT_IDS?.split(",").map((id) => id.trim()) || [],
  paginationLimit: 5,
};

// Validate environment variables
export function validateConfig() {
  if (!config.botToken) {
    throw new Error("BOT_TOKEN environment variable is required");
  }

  if (!config.miniAppUrl) {
    throw new Error("MINI_APP_URL environment variable is required");
  }

  if (config.adminChatIds.length === 0) {
    throw new Error("ADMIN_CHAT_IDS environment variable is required");
  }
}
