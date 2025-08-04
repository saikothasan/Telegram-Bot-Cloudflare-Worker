# Basic Telegram Bot Example

This example demonstrates how to create a simple Telegram bot using the `telegram-bot-cloudflare-worker` library.

## Features

- ✅ Basic command handling (`/start`, `/help`, `/echo`, `/time`, `/keyboard`)
- ✅ Inline keyboard interactions
- ✅ Message type detection (text, photo, document, voice, location)
- ✅ Callback query handling
- ✅ Error handling and logging
- ✅ Health check and bot info endpoints

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Bot Token

First, create a bot with [@BotFather](https://t.me/BotFather) on Telegram and get your bot token.

Then set the token as a secret:

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
```

### 3. Deploy to Cloudflare Workers

```bash
npm run deploy
```

### 4. Set Up Webhook

After deployment, visit your worker URL + `/setup` to configure the webhook:

```
https://your-worker.your-subdomain.workers.dev/setup
```

## Development

### Local Development

```bash
npm run dev
```

This will start the development server. You can test endpoints locally, but webhooks won't work in development mode.

### View Logs

```bash
npm run logs
```

## Usage

Once deployed and configured:

1. Start a chat with your bot on Telegram
2. Send `/start` to see the welcome message
3. Try other commands like `/help`, `/echo hello`, `/time`, `/keyboard`
4. Interact with inline keyboards and send different types of messages

## Available Commands

- `/start` - Show welcome message with inline keyboard
- `/help` - Display help information
- `/echo <text>` - Echo your message back
- `/time` - Get current UTC time
- `/keyboard` - Show interactive keyboard example

## Bot Endpoints

- `/` - Bot information page
- `/health` - Health check endpoint
- `/info` - Bot information (JSON)
- `/setup` - Configure webhook
- `/webhook` - Webhook endpoint (for Telegram)

## Customization

You can customize this bot by:

1. Adding new commands to the router
2. Implementing additional message handlers
3. Adding state management with KV or Durable Objects
4. Integrating with external APIs
5. Adding authentication middleware

## File Structure

```
basic-bot/
├── src/
│   └── index.ts          # Main bot code
├── package.json          # Dependencies and scripts
├── wrangler.toml         # Cloudflare Workers configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Next Steps

- Check out the [advanced bot example](../advanced-bot/) for more features
- Read the [main documentation](../../README.md) for detailed API reference
- Explore middleware options for authentication, rate limiting, etc.
- Add state management with Workers KV or Durable Objects

