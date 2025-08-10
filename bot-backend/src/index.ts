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
      // Admin response - no Mini App button
      await ctx.reply(
        "👨‍💼 Welcome, Admin!\n\n🔔 You will receive ping notifications from users.\n\n📊 Admin features:\n• Receive all ping notifications\n• View user activity\n• No action required from you"
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
