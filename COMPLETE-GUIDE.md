# Ping Bot - Complete Setup Guide

## How the App Works

This is a Telegram Bot with a Mini App that allows users to send "ping" notifications to administrators.

### User Flow:

**For Regular Users:**

1. User sends `/start` to the bot
2. Bot responds with a button to open the Mini App
3. User clicks the Mini App button
4. Mini App opens with a "Ping Admin" button
5. User clicks "Ping Admin"
6. Mini App sends data to bot and closes automatically
7. Bot processes the ping and sends notifications to administrators
8. Bot sends confirmation message back to the user in the main chat
9. User receives confirmation that the ping was successfully sent

**For Administrators:**

1. Admin sends `/start` to the bot
2. Bot responds with admin welcome message (no Mini App button)
3. Admin receives ping notifications from users automatically
4. No action required from admin

### Technical Architecture:

- **Bot Backend**: Handles Telegram bot logic and database
- **Mini App**: React web app that runs inside Telegram
- **Database**: SQLite database storing user information and roles

## Complete Setup Process

### Step 1: Create Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Choose a name and username for your bot
4. **Save the bot token** (format: `123456789:ABCdefGhIJklmNoPQRsTUVwxYZ`)

### Step 2: Get Your Chat ID (for admin notifications)

1. Message [@userinfobot](https://t.me/userinfobot)
2. **Save your User ID** - this is your Chat ID (format: `123456789`)

### Step 3: Launch Bot Backend

**Terminal 1:**

```bash
cd bot-backend
pnpm install
cp .env.example .env
```

**Edit `.env` file:**

```env
BOT_TOKEN=your_bot_token_from_step_1
MINI_APP_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"
ADMIN_CHAT_IDS=your_chat_id_from_step_2
```

**Setup database and start:**

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

### Step 4: Launch Mini App with Tunneling

**Terminal 2:**

```bash
cd mini-app
pnpm install
pnpm dev:tunnel
```

This will start the Mini App and create a public tunnel URL (e.g., `https://ping-mini-app.loca.lt`)

**📖 For detailed tunneling setup, see [TUNNELING.md](./TUNNELING.md)**

### Step 5: Connect Mini App to Bot

1. Go back to [@BotFather](https://t.me/botfather)
2. Select your bot
3. Choose "Bot Settings" → "Menu Button"
4. Set URL to your tunnel URL: `https://your-tunnel-url.loca.lt`
5. Set Button text to: "Open App" (optional)

**Also update your bot backend .env:**

```env
MINI_APP_URL=https://your-tunnel-url.loca.lt
```

Restart bot backend: `pnpm dev`

### Step 6: Test the Complete Flow

1. Find your bot in Telegram (search for the username you chose)
2. Send `/start` command
3. Click "🚀 Open Mini App" button
4. Click "🔔 Ping Admin" in the Mini App
5. Mini App will close automatically after sending
6. **You should receive a notification as an admin!**
7. **You should also receive a confirmation message in the main chat**

The complete flow ensures you get confirmation that your ping was successfully sent to administrators.

## User Roles

### ADMINISTRATOR

- Receives ping notifications from users
- Added automatically from `ADMIN_CHAT_IDS` in .env
- Sees admin welcome message when using `/start` (no Mini App button)
- No special commands needed - only receives notifications

### CLIENT

- Can send ping notifications via Mini App
- Automatically created when user sends `/start`
- Sees Mini App button when using `/start`
- No admin privileges

## Connecting Backend and Frontend

The connection works through Telegram's Web App API:

1. **Mini App** uses `window.Telegram.WebApp.sendData()` to send JSON data
2. **Bot Backend** receives this data via `bot.on('web_app_data')` event
3. **Bot Backend** parses the data and sends notifications to admins
4. **Bot Backend** sends confirmation message back to user in main chat

### Data Flow:

```
Mini App → Telegram WebApp API → Bot Backend → Admin Notifications → User Confirmation
```

## Environment Variables Explained

**BOT_TOKEN**: Your bot's authentication token from BotFather
**MINI_APP_URL**: Where your Mini App is hosted (local or production)
**DATABASE_URL**: SQLite database file location
**ADMIN_CHAT_IDS**: Comma-separated list of Chat IDs who receive notifications

## Production Deployment

### For Production:

1. Deploy bot backend to a server (Heroku, Railway, VPS)
2. Deploy mini app to a static host (Vercel, Netlify, GitHub Pages)
3. Update `MINI_APP_URL` in bot backend .env to your deployed frontend URL
4. Update Mini App URL in BotFather to your deployed frontend URL
5. Ensure your production database is properly configured

### Important Notes:

- Mini Apps must be served over HTTPS in production
- Bot backend can run on HTTP but HTTPS is recommended
- Keep your BOT_TOKEN secret and secure
- Admin Chat IDs should be real Telegram user IDs

## Troubleshooting Common Issues

**Bot doesn't respond to /start:**

- Check BOT_TOKEN is correct
- Ensure bot backend is running
- Check terminal logs for errors

**Mini App button doesn't appear:**

- Verify MINI_APP_URL is set in bot backend
- Check that Mini App URL is configured in BotFather

**Mini App doesn't open:**

- Ensure mini app is running on correct port (5173)
- Check browser console for errors
- Verify URL in BotFather matches your running app

**No admin notifications:**

- Verify ADMIN_CHAT_IDS in .env
- Run `pnpm db:seed` in bot backend
- Check that Chat IDs are correct numbers
- Ensure you've sent /start to the bot at least once

**Database errors:**

- Delete `dev.db` file and run `pnpm db:push` again
- Make sure you're in the correct directory
- Check file permissions
