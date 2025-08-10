# 📱 Ping App

A Telegram bot with a mini app that allows users to send ping notifications to administrators. The bot provides admin functionality for user management with pagination and real-time statistics.

## 🚀 Features

- **📲 Mini App**: React-based Telegram Web App for sending ping notifications
- **👑 Admin Panel**: Bot commands for administrators to manage users
- **📊 User Management**: List all users with pagination (excluding admins)
- **📈 Statistics**: Real-time user count and admin statistics
- **🔐 Role-based Access**: Separate functionality for administrators and regular users
- **🗄️ Database**: SQLite database with Prisma ORM for data persistence

## 🛠️ Technologies Used

### Backend (Bot)

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Telegraf** - Modern Telegram Bot API framework
- **Prisma** - Next-generation ORM for database management
- **SQLite** - Lightweight database
- **dotenv** - Environment variable management

### Frontend (Mini App)

- **React 18** - User interface library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Telegram Apps SDK** - Official Telegram Web Apps integration

## 📁 Repository Structure

```
ping-app/
├── bot-backend/                 # Telegram bot backend
│   ├── src/
│   │   ├── index.ts            # Main bot logic and handlers
│   │   ├── config.ts           # Configuration and environment variables
│   │   ├── database.ts         # Database connection setup
│   │   ├── userService.ts      # User management service
│   │   └── seed.ts             # Database seeding script
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── dev.db              # SQLite database file
│   ├── package.json
│   ├── tsconfig.json
│   └── pnpm-lock.yaml
└── mini-app/                    # React mini app frontend
    ├── src/
    │   ├── App.tsx             # Main React component
    │   ├── main.tsx            # Application entry point
    │   └── index.css           # Styles
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

## ⚙️ Setup and Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm
- **Telegram Bot Token** (from [@BotFather](https://t.me/botfather))

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ping-app
```

### 2. Install Dependencies

```bash
# Install dependencies for both backend and mini app
pnpm install

# Or install individually
cd bot-backend && pnpm install
cd ../mini-app && pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the `bot-backend` directory:

```env
# Required: Get from @BotFather on Telegram
BOT_TOKEN=your_bot_token_here

# Required: URL where your mini app will be hosted
# For development, use ngrok: ngrok http 5173
# For other hosting, configure vite.config.ts with HTTPS and CORS
MINI_APP_URL=https://your-mini-app-url.com

# Required: Comma-separated list of admin Telegram chat IDs
ADMIN_CHAT_IDS=123456789,987654321
```

### 4. Database Setup

```bash
cd bot-backend

# Generate Prisma client
pnpm run db:generate

# Push database schema
pnpm run db:push

# Seed the database with admin users
pnpm run db:seed
```

### 5. Development Setup

#### Backend (Bot)

```bash
cd bot-backend
pnpm run dev
```

The bot will start in development mode with hot reload.

#### Frontend (Mini App)

```bash
cd mini-app
pnpm run dev
```

The mini app will be available at `http://localhost:5173` by default.

## 🎮 Usage

### For Regular Users

1. Start the bot in Telegram
2. Click the "📱 Open Mini App" button
3. Send a ping notification to administrators

### For Administrators

- **👥 List Users** - View all registered users with pagination
- **📊 Statistics** - View user count and admin statistics
- **🔄 Refresh** - Update the current view

## 🗄️ Database Management

### Available Scripts

```bash
# Generate Prisma client after schema changes
pnpm run db:generate

# Push schema changes to database
pnpm run db:push

# Seed database with admin users
pnpm run db:seed

# Open Prisma Studio (database GUI)
pnpm run db:studio
```

### Database Schema

```prisma
model User {
  id       Int      @id @default(autoincrement())
  chatId   String   @unique
  username String?
  role     UserRole @default(CLIENT)
}

enum UserRole {
  ADMINISTRATOR
  CLIENT
}
```

## 🔧 Configuration

### Pagination

The user list pagination limit is configurable in `bot-backend/src/config.ts`:

```typescript
export const config = {
  // ... other config
  paginationLimit: 5, // Users per page
};
```

### Environment Variables

| Variable         | Required | Description                             |
| ---------------- | -------- | --------------------------------------- |
| `BOT_TOKEN`      | ✅       | Telegram bot token from @BotFather      |
| `MINI_APP_URL`   | ✅       | URL where the mini app is hosted        |
| `ADMIN_CHAT_IDS` | ✅       | Comma-separated admin Telegram chat IDs |

## 📝 Logging

The application includes strategic console logging for:

- 🚀 Bot startup/shutdown events
- 👑 Admin access actions
- 📨 Ping processing with notification counts
- ❌ Error handling and failures
- 🌱 Database seeding progress

## 📄 License

This project is licensed under the MIT License.
