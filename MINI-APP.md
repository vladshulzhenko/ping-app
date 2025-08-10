# Mini App - Launch Guide

## Prerequisites

- Node.js 18+
- pnpm installed globally (`npm install -g pnpm`)

## Setup & Launch

### 1. Install Dependencies

```bash
cd mini-app
pnpm install
```

### 2. Launch the App

**Local Development:**

```bash
# Development mode (with hot reload)
pnpm dev
```

The app will be available at: **http://localhost:5173**

**With Tunneling (for Telegram testing):**

```bash
# Development mode with public tunnel
pnpm dev:tunnel
```

This will start both the dev server AND create a public tunnel URL that you can use in Telegram Bot.

### 3. Tunneling for Telegram

To test your Mini App inside Telegram, you need to expose it to the internet:

**Quick Setup:**

```bash
pnpm dev:tunnel
```

**Manual Setup:**

```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Create tunnel
./tunnel.sh
```

**Available tunnel options:**

- `pnpm tunnel:localtunnel` - Free tunneling with LocalTunnel
- `pnpm tunnel:ngrok` - ngrok tunneling (requires setup)

📖 **See [TUNNELING.md](./TUNNELING.md) for detailed tunneling setup guide**

### 4. Build for Production

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm dev:tunnel` - Start dev server with public tunnel (for Telegram testing)
- `pnpm tunnel:localtunnel` - Create LocalTunnel (free)
- `pnpm tunnel:ngrok` - Create ngrok tunnel (requires setup)
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally

## Development Notes

### Local Testing

The mini app can be tested in a regular browser during development:

- Open http://localhost:5173 in your browser
- The app will work in "development mode"
- Clicking "Ping Admin" will show a success message but won't send actual data

### Telegram Integration

To test within Telegram:

1. Make sure the bot backend is running
2. Set up the Mini App URL in [@BotFather](https://t.me/botfather)
3. Use `/start` command in your bot to access the Mini App

### File Structure

```
src/
├── main.tsx          # App entry point
├── App.tsx           # Main component with ping functionality
└── index.css         # Telegram-themed styles
```

### Styling

The app uses Telegram CSS variables for theming:

- `--tg-theme-bg-color` - Background color
- `--tg-theme-text-color` - Text color
- `--tg-theme-button-color` - Button color
- `--tg-theme-button-text-color` - Button text color
- `--tg-theme-hint-color` - Secondary text color

This ensures the app matches the user's Telegram theme automatically.

## Troubleshooting

**App doesn't load:**

- Check that port 5173 is not in use
- Try running `pnpm install` again
- Check terminal for error messages

**Build fails:**

- Ensure all dependencies are installed
- Check for TypeScript errors
- Run `pnpm build` and fix any compilation errors

**Hot reload not working:**

- Restart the dev server
- Check that files are being saved properly
- Clear browser cache
