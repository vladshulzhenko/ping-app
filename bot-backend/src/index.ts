import { Telegraf } from "telegraf";
import { config, validateConfig } from "./config";
import { UserService } from "./userService";
import prisma from "./database";

validateConfig();

const bot = new Telegraf(config.botToken);
const userService = new UserService();

// Start the bot
async function startBot() {
  try {
    console.log("Starting bot...");
    await bot.launch();
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
}

bot.start(async (ctx) => {
  try {
    const chatId = ctx.chat.id.toString();
    const user = ctx.from;

    // First check if user is already an admin (seeded)
    let dbUser = await userService.getUserByChatId(chatId);
    const isAdmin = dbUser?.role === "ADMINISTRATOR";

    if (!isAdmin) {
      // Only create/update user if they're not an admin
      // Admins should already be seeded in the database
      await userService.createOrUpdateUser(chatId, {
        username: user?.username,
        firstName: user?.first_name,
        lastName: user?.last_name,
      });

      // Get the updated user data
      dbUser = await userService.getUserByChatId(chatId);
    }

    if (isAdmin) {
      // Admin response with admin keyboard
      await ctx.reply(
        "👨‍💼 Welcome, Admin!\n\n🔔 You will receive ping notifications from users.\n\n📊 Admin features:\n• Receive all ping notifications\n• View user activity\n• Manage users",
        {
          reply_markup: {
            keyboard: [
              [{ text: "👥 List All Users" }],
              [{ text: "📊 User Statistics" }],
            ],
            resize_keyboard: true,
            is_persistent: true,
          },
        }
      );
    } else {
      // Regular user response - with Mini App button
      await ctx.reply(
        "Welcome to Ping Bot! 👋\n\nClick the button below to open the Mini App:",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🚀 Open Mini App",
                  web_app: { url: config.miniAppUrl },
                },
              ],
            ],
          },
        }
      );
    }
  } catch (error) {
    console.error("Error in start command:", error);
    await ctx.reply("Sorry, something went wrong. Please try again.");
  }
});

// Helper function to check if user is admin
async function isUserAdmin(chatId: string): Promise<boolean> {
  const user = await userService.getUserByChatId(chatId);
  return user?.role === "ADMINISTRATOR";
}

// Helper function to format user info
function formatUserInfo(user: any, index: number): string {
  const role = user.role === "ADMINISTRATOR" ? "👨‍💼 Admin" : "👤 Client";
  const name = user.username
    ? `@${user.username}`
    : `${user.firstName || ""} ${user.lastName || ""}`.trim() || "No name";
  const created = new Date(user.createdAt).toLocaleDateString();

  return `${index}. ${role}\n   👤 ${name}\n   🆔 ${user.chatId}\n   📅 ${created}`;
}

// Helper function to create pagination keyboard
function createPaginationKeyboard(
  currentPage: number,
  totalPages: number
): any {
  const keyboard = [];

  if (totalPages > 1) {
    const row = [];

    if (currentPage > 1) {
      row.push({
        text: "⬅️ Previous",
        callback_data: `users_page_${currentPage - 1}`,
      });
    }

    row.push({
      text: `${currentPage}/${totalPages}`,
      callback_data: "users_current_page",
    });

    if (currentPage < totalPages) {
      row.push({
        text: "Next ➡️",
        callback_data: `users_page_${currentPage + 1}`,
      });
    }

    keyboard.push(row);
  }

  keyboard.push([
    {
      text: "🔄 Refresh",
      callback_data: `users_page_${currentPage}`,
    },
  ]);

  return { inline_keyboard: keyboard };
}

// Admin command handlers
bot.hears("👥 List All Users", async (ctx) => {
  try {
    const chatId = ctx.chat.id.toString();

    if (!(await isUserAdmin(chatId))) {
      await ctx.reply("❌ Access denied. Admin privileges required.");
      return;
    }

    const result = await userService.getAllUsers(1, 5);

    if (result.users.length === 0) {
      await ctx.reply("📭 No users found in the database.");
      return;
    }

    let message = `👥 **User List** (${result.totalCount} total)\n\n`;

    result.users.forEach((user, index) => {
      const globalIndex = (result.currentPage - 1) * 5 + index + 1;
      message += formatUserInfo(user, globalIndex) + "\n\n";
    });

    await ctx.reply(message, {
      parse_mode: "Markdown",
      reply_markup: createPaginationKeyboard(
        result.currentPage,
        result.totalPages
      ),
    });
  } catch (error) {
    console.error("Error listing users:", error);
    await ctx.reply("❌ Error retrieving user list. Please try again.");
  }
});

bot.hears("📊 User Statistics", async (ctx) => {
  try {
    const chatId = ctx.chat.id.toString();

    if (!(await isUserAdmin(chatId))) {
      await ctx.reply("❌ Access denied. Admin privileges required.");
      return;
    }

    const stats = await userService.getUserStats();

    const message =
      `📊 **User Statistics**\n\n` +
      `👥 Total Users: ${stats.totalUsers}\n` +
      `👨‍💼 Administrators: ${stats.adminCount}\n` +
      `👤 Clients: ${stats.clientCount}`;

    await ctx.reply(message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error getting user statistics:", error);
    await ctx.reply("❌ Error retrieving statistics. Please try again.");
  }
});

// Callback query handler for pagination
bot.on("callback_query", async (ctx) => {
  try {
    const callbackQuery = ctx.callbackQuery;

    // Type guard to check if this is a data callback query
    if (!("data" in callbackQuery)) {
      await ctx.answerCbQuery("❌ Invalid callback query");
      return;
    }

    const callbackData = callbackQuery.data;
    const chatId = ctx.chat?.id.toString();

    if (!chatId || !(await isUserAdmin(chatId))) {
      await ctx.answerCbQuery("❌ Access denied");
      return;
    }

    if (callbackData?.startsWith("users_page_")) {
      const page = parseInt(callbackData.replace("users_page_", ""));

      if (isNaN(page) || page < 1) {
        await ctx.answerCbQuery("❌ Invalid page number");
        return;
      }

      const result = await userService.getAllUsers(page, 5);

      if (result.users.length === 0) {
        await ctx.answerCbQuery("📭 No users found on this page");
        return;
      }

      let message = `👥 **User List** (${result.totalCount} total)\n\n`;

      result.users.forEach((user, index) => {
        const globalIndex = (result.currentPage - 1) * 5 + index + 1;
        message += formatUserInfo(user, globalIndex) + "\n\n";
      });

      await ctx.editMessageText(message, {
        parse_mode: "Markdown",
        reply_markup: createPaginationKeyboard(
          result.currentPage,
          result.totalPages
        ),
      });

      await ctx.answerCbQuery(`📄 Page ${page} of ${result.totalPages}`);
    } else if (callbackData === "users_current_page") {
      await ctx.answerCbQuery("📄 Current page");
    }
  } catch (error) {
    console.error("Error handling callback query:", error);
    await ctx.answerCbQuery("❌ Error processing request");
  }
});

bot.on("message", async (ctx) => {
  console.log("📬 Message received:");
  console.log("- Message type:", ctx.message);
  console.log("- WebApp data:", ctx.webAppData);
  console.log("- Update type:", ctx.updateType);
  console.log("- Full context keys:", Object.keys(ctx));

  const webAppData = ctx.webAppData;
  try {
    if (!webAppData) {
      console.log("❌ No web app data in this message");
      return;
    }

    console.log("✅ WebApp data found, parsing...");

    const dataText = webAppData.data.text();
    console.log("📦 Raw data text:", dataText);
    const data = JSON.parse(dataText);
    console.log("📦 Parsed data:", data);

    if (data.action === "ping") {
      const user = ctx.from;
      const chatId = ctx.chat.id.toString();

      console.log(`📨 Ping request received from user ${chatId}`);

      const dbUser = await userService.getUserByChatId(chatId);

      const userName = user?.username
        ? `@${user.username}`
        : `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
          "Unknown User";

      const notificationMessage = `🔔 Ping notification!\n\nUser: ${userName}\nChat ID: ${chatId}\nTime: ${new Date().toLocaleString()}`;

      // Send notification to all admins
      const admins = await userService.getAllAdmins();
      let notificationsSent = 0;
      let failedAdmins = 0;

      console.log(`📬 Sending notifications to ${admins.length} admin(s)...`);

      for (const admin of admins) {
        try {
          await ctx.telegram.sendMessage(admin.chatId, notificationMessage);
          notificationsSent++;
          console.log(`✅ Notification sent to admin ${admin.chatId}`);
        } catch (error) {
          failedAdmins++;
          console.error(
            `❌ Failed to send notification to admin ${admin.chatId}:`,
            error
          );
        }
      }

      // Log the result but don't send confirmation message to user
      if (notificationsSent > 0) {
        console.log(
          `✅ Ping processed for user ${chatId}: ${notificationsSent}/${admins.length} admins notified`
        );
      } else {
        console.log(`❌ Failed to notify any admins for user ${chatId}`);
      }
    }
  } catch (error) {
    console.error("Error handling web app data:", error);
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Graceful shutdown
process.once("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully...");
  bot.stop("SIGINT");
  prisma.$disconnect();
});

process.once("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  bot.stop("SIGTERM");
  prisma.$disconnect();
});

// Start the bot
startBot();
