# Bot Backend - Launch Guide

## Prerequisites

- Node.js 18+
- pnpm installed globally (`npm install -g pnpm`)

## Setup & Launch

### 1. Install Dependencies

```bash
cd bot-backend
pnpm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` file with your values:

```env
BOT_TOKEN=your_telegram_bot_token_here
MINI_APP_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"
ADMIN_CHAT_IDS=123456789,987654321
```

**How to get BOT_TOKEN:**

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot with `/newbot`
3. Copy the token provided

**How to get ADMIN_CHAT_IDS:**

1. Message [@userinfobot](https://t.me/userinfobot)
2. Copy your User ID (this is your Chat ID)
3. Add multiple IDs separated by commas

### 3. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Create database
pnpm db:push

# Seed admin users
pnpm db:seed
```

### 4. Launch the Bot

```bash
# Development mode (with auto-restart)
pnpm dev

# Production mode
pnpm build
pnpm start
```

## Available Scripts

- `pnpm dev` - Start in development mode with auto-restart
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production build
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:seed` - Seed admin users
- `pnpm db:studio` - Open Prisma Studio (database viewer)

## Troubleshooting

**Bot doesn't respond:**

- Check BOT_TOKEN is correct
- Ensure bot is started via /start command in Telegram
- Check terminal for error messages

**Database errors:**

- Delete `dev.db` file and run `pnpm db:push` again
- Make sure you're in the `bot-backend` directory

**Admin notifications not working:**

- Verify ADMIN_CHAT_IDS in .env
- Run `pnpm db:seed` to create admin users
- Check that Chat IDs are correct numbers

## Logs

The bot will log important events to the console:

- Bot startup confirmation
- Incoming messages and web app data
- Error messages
- Database operations
