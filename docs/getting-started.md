# Getting Started with Telegram Bot Cloudflare Worker

This guide will help you create your first Telegram bot using the `telegram-bot-cloudflare-worker` library and deploy it to Cloudflare Workers.

## Prerequisites

Before you begin, make sure you have:

- A Telegram account
- A Cloudflare account (free tier is sufficient)
- Node.js 18+ installed on your machine
- Basic knowledge of TypeScript/JavaScript

## Step 1: Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Start a chat and send `/newbot`
3. Follow the instructions to choose a name and username for your bot
4. Save the bot token that BotFather provides - you'll need it later

## Step 2: Set Up Your Development Environment

### Install Wrangler CLI

```bash
npm install -g wrangler
```

### Login to Cloudflare

```bash
wrangler login
```

This will open a browser window for you to authenticate with Cloudflare.

## Step 3: Create a New Project

### Initialize the Project

```bash
mkdir my-telegram-bot
cd my-telegram-bot
npm init -y
```

### Install Dependencies

```bash
npm install telegram-bot-cloudflare-worker
npm install -D @cloudflare/workers-types typescript wrangler
```

### Create TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Create Wrangler Configuration

Create `wrangler.toml`:

```toml
name = "my-telegram-bot"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
TELEGRAM_API_URL = "https://api.telegram.org"
```

## Step 4: Write Your First Bot

Create `src/index.ts`:

```typescript
import { createBot, createWorkerHandler } from 'telegram-bot-cloudflare-worker';

// Environment interface
interface Env {
  TELEGRAM_BOT_TOKEN: string;
}

// Create bot instance
const { client, updateHandler, adapter } = createBot({
  token: '', // Will be set from environment
});

// Handle /start command
updateHandler.onMessage(async (ctx) => {
  const message = ctx.update.message;
  
  if (message?.text === '/start') {
    await ctx.client.sendMessage({
      chat_id: message.chat.id,
      text: 'Hello! I am your first Telegram bot running on Cloudflare Workers! 🚀',
    });
  } else if (message?.text) {
    // Echo other messages
    await ctx.client.sendMessage({
      chat_id: message.chat.id,
      text: `You said: ${message.text}`,
    });
  }
});

// Export Worker handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Set bot token from environment
    if (!env.TELEGRAM_BOT_TOKEN) {
      return new Response('Bot token not configured', { status: 500 });
    }

    // Update client with token
    (client as any).apiUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;

    const url = new URL(request.url);

    // Setup webhook endpoint
    if (url.pathname === '/setup') {
      const webhookUrl = `${url.origin}/webhook`;
      await adapter.setupWebhook(webhookUrl, env);
      return new Response(`Webhook configured: ${webhookUrl}`);
    }

    // Webhook endpoint
    if (url.pathname === '/webhook') {
      return adapter.handleWebhook(request, env);
    }

    // Default response
    return new Response('Bot is running!');
  },
};
```

## Step 5: Configure Secrets

Set your bot token as a secret (replace `YOUR_BOT_TOKEN` with the actual token from BotFather):

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
```

When prompted, enter your bot token.

## Step 6: Deploy Your Bot

```bash
wrangler deploy
```

After deployment, you'll get a URL like `https://my-telegram-bot.your-subdomain.workers.dev`.

## Step 7: Configure the Webhook

Visit your worker URL with `/setup` appended:

```
https://my-telegram-bot.your-subdomain.workers.dev/setup
```

You should see a message confirming that the webhook was configured.

## Step 8: Test Your Bot

1. Open Telegram and find your bot (search for the username you created)
2. Start a chat and send `/start`
3. Your bot should respond with the welcome message
4. Try sending other messages to see the echo functionality

## Next Steps

Congratulations! You've created and deployed your first Telegram bot. Here are some ideas for what to do next:

### Add More Commands

```typescript
import { createCommandRouter } from 'telegram-bot-cloudflare-worker';

const router = createCommandRouter();

router
  .command({
    command: 'hello',
    description: 'Say hello',
    handler: async (ctx) => {
      await ctx.client.sendMessage({
        chat_id: ctx.update.message!.chat.id,
        text: 'Hello there! 👋',
      });
    },
  })
  .command({
    command: 'time',
    description: 'Get current time',
    handler: async (ctx) => {
      const now = new Date().toISOString();
      await ctx.client.sendMessage({
        chat_id: ctx.update.message!.chat.id,
        text: `Current time: ${now}`,
      });
    },
  });

updateHandler.use(router.middleware());
```

### Add Inline Keyboards

```typescript
import { InlineKeyboardBuilder } from 'telegram-bot-cloudflare-worker';

// In your message handler
const keyboard = new InlineKeyboardBuilder()
  .callback('Button 1', 'btn1')
  .callback('Button 2', 'btn2')
  .row()
  .url('Visit Website', 'https://example.com')
  .build();

await ctx.client.sendMessage({
  chat_id: message.chat.id,
  text: 'Choose an option:',
  reply_markup: keyboard,
});

// Handle button clicks
updateHandler.onCallbackQuery(async (ctx) => {
  const query = ctx.update.callback_query!;
  
  await ctx.client.answerCallbackQuery({
    callback_query_id: query.id,
    text: `You clicked ${query.data}!`,
  });
});
```

### Add State Management

First, create a KV namespace:

```bash
wrangler kv:namespace create "BOT_STATE"
```

Add it to your `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "BOT_STATE"
id = "your_kv_namespace_id"
```

Use it in your bot:

```typescript
import { BotStateKV } from 'telegram-bot-cloudflare-worker';

// In your handler
const kv = new BotStateKV(env.BOT_STATE);

// Save user state
await kv.setUserState(userId, { 
  lastCommand: 'start',
  messageCount: 1 
});

// Get user state
const userState = await kv.getUserState(userId);
```

### Add Middleware

```typescript
import { logger, auth } from 'telegram-bot-cloudflare-worker';

updateHandler
  .use(logger({ logLevel: 'info' }))
  .use(auth({
    allowedUsers: [123456789], // Your user ID
    sendDeniedMessage: true,
  }));
```

## Common Issues and Solutions

### Bot Not Responding

1. **Check the webhook**: Visit `/setup` again to reconfigure
2. **Verify token**: Make sure the bot token is correctly set as a secret
3. **Check logs**: Use `wrangler tail` to see real-time logs

### Webhook Setup Failed

1. **Check URL**: Make sure your worker URL is accessible
2. **Token issues**: Verify the bot token is valid
3. **Network**: Ensure Cloudflare Workers can reach Telegram's API

### TypeScript Errors

1. **Update types**: Make sure you have the latest `@cloudflare/workers-types`
2. **Check imports**: Verify all imports are correct
3. **Strict mode**: Consider disabling strict mode temporarily if needed

## Development Tips

### Local Development

For local development, you can use polling instead of webhooks:

```typescript
// Development mode (not for production)
if (env.ENVIRONMENT === 'development') {
  // Use long polling for local development
  setInterval(async () => {
    const updates = await client.getUpdates({ timeout: 10 });
    for (const update of updates) {
      await updateHandler.processUpdate(update, client);
    }
  }, 1000);
}
```

### Environment Variables

Use different configurations for development and production:

```toml
[env.development]
name = "my-telegram-bot-dev"

[env.production]
name = "my-telegram-bot-prod"
```

Deploy to different environments:

```bash
wrangler deploy --env development
wrangler deploy --env production
```

### Debugging

Add logging to understand what's happening:

```typescript
updateHandler.onMessage(async (ctx) => {
  console.log('Received message:', ctx.update.message);
  // Your handler code
});
```

View logs in real-time:

```bash
wrangler tail
```

## Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Library API Reference](./api-reference.md)
- [Examples](../examples/)
- [Troubleshooting Guide](./troubleshooting.md)

## Getting Help

If you run into issues:

1. Check the [troubleshooting guide](./troubleshooting.md)
2. Look at the [examples](../examples/) for reference
3. Search existing [GitHub issues](https://github.com/your-repo/issues)
4. Create a new issue with details about your problem

Happy bot building! 🤖

