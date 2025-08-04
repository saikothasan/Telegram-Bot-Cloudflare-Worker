# Telegram Bot Cloudflare Worker

A comprehensive and professional TypeScript library for building Telegram bots on Cloudflare Workers. This library provides full Telegram Bot API coverage, production-ready features, and seamless integration with Cloudflare Workers ecosystem.

## Features

- 🚀 **Full Telegram Bot API Support** - Complete coverage of all Telegram Bot API methods and types
- 🔒 **Type-Safe** - Written in TypeScript with comprehensive type definitions
- ⚡ **Cloudflare Workers Optimized** - Built specifically for Cloudflare Workers environment
- 🛡️ **Production Ready** - Includes error handling, rate limiting, and retry logic
- 🔧 **Middleware System** - Extensible middleware for authentication, logging, and custom logic
- 📁 **State Management** - Built-in support for Workers KV and Durable Objects
- 🎯 **Command Routing** - Powerful command system with validation and help generation
- 📝 **Rich Utilities** - Text formatting, keyboard builders, file handling, and more
- 🧪 **Well Tested** - Comprehensive test suite with Jest
- 📚 **Excellent Documentation** - Detailed guides and examples

## Installation

```bash
npm install telegram-bot-cloudflare-worker
```

## Quick Start

### Basic Bot

```typescript
import { createBot, createWorkerHandler } from 'telegram-bot-cloudflare-worker';

// Create bot instance
const { client, updateHandler, adapter } = createBot({
  token: 'YOUR_BOT_TOKEN',
});

// Add message handler
updateHandler.onMessage(async (ctx) => {
  if (ctx.update.message?.text === '/start') {
    await ctx.client.sendMessage({
      chat_id: ctx.update.message.chat.id,
      text: 'Hello! I am your Cloudflare Workers bot.',
    });
  }
});

// Export Worker handler
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const handler = createWorkerHandler(adapter);
    return handler(request, env, ctx);
  },
};
```

### Advanced Bot with Middleware

```typescript
import { 
  createBot, 
  createWorkerHandler, 
  createCommandRouter,
  auth,
  logger,
  InlineKeyboardBuilder 
} from 'telegram-bot-cloudflare-worker';

const { client, updateHandler, adapter } = createBot({
  token: 'YOUR_BOT_TOKEN',
});

// Add middleware
updateHandler
  .use(logger({ logLevel: 'info' }))
  .use(auth({
    allowedUsers: [123456789], // Your user ID
    sendDeniedMessage: true,
  }));

// Create command router
const router = createCommandRouter();

router
  .command({
    command: 'start',
    description: 'Start the bot',
    handler: async (ctx) => {
      const keyboard = new InlineKeyboardBuilder()
        .url('Documentation', 'https://github.com/your-repo')
        .callback('Settings', 'settings')
        .build();

      await ctx.client.sendMessage({
        chat_id: ctx.update.message!.chat.id,
        text: 'Welcome to the advanced bot!',
        reply_markup: keyboard,
      });
    },
  })
  .command({
    command: 'echo',
    description: 'Echo your message',
    requiresArgs: true,
    handler: async (ctx) => {
      const text = ctx.args.join(' ');
      await ctx.client.sendMessage({
        chat_id: ctx.update.message!.chat.id,
        text: `You said: ${text}`,
      });
    },
  });

// Use command router
updateHandler.use(router.middleware());

// Handle callback queries
updateHandler.onCallbackQuery(async (ctx) => {
  const query = ctx.update.callback_query!;
  
  if (query.data === 'settings') {
    await ctx.client.answerCallbackQuery({
      callback_query_id: query.id,
      text: 'Settings clicked!',
    });
  }
});

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const handler = createWorkerHandler(adapter);
    return handler(request, env, ctx);
  },
};
```

## Core Concepts

### TelegramClient

The `TelegramClient` class provides access to all Telegram Bot API methods with full type safety:

```typescript
import { TelegramClient } from 'telegram-bot-cloudflare-worker';

const client = new TelegramClient({
  token: 'YOUR_BOT_TOKEN',
  enableRateLimit: true,
  maxRetries: 3,
});

// Send a message
const message = await client.sendMessage({
  chat_id: 123456789,
  text: 'Hello, World!',
  parse_mode: 'MarkdownV2',
});

// Send a photo
await client.sendPhoto({
  chat_id: 123456789,
  photo: 'https://example.com/photo.jpg',
  caption: 'A beautiful photo',
});
```

### UpdateHandler

The `UpdateHandler` manages incoming updates and provides a middleware system:

```typescript
import { UpdateHandler, commandParser, logger } from 'telegram-bot-cloudflare-worker';

const updateHandler = new UpdateHandler({
  handleEditedMessages: true,
  handleInlineQueries: true,
});

// Add middleware
updateHandler
  .use(commandParser())
  .use(logger())
  .use(async (ctx, next) => {
    console.log('Processing update:', ctx.update.update_id);
    await next();
  });

// Add handlers
updateHandler
  .onMessage(async (ctx) => {
    // Handle messages
  })
  .onCallbackQuery(async (ctx) => {
    // Handle callback queries
  })
  .onInlineQuery(async (ctx) => {
    // Handle inline queries
  });
```

### CloudflareWorkersAdapter

The adapter integrates your bot with Cloudflare Workers:

```typescript
import { CloudflareWorkersAdapter, BotStateKV } from 'telegram-bot-cloudflare-worker';

const adapter = new CloudflareWorkersAdapter({
  client,
  updateHandler,
  verifyWebhookSecret: true,
});

// In your Worker
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    // Handle webhook
    if (request.url.endsWith('/webhook')) {
      return adapter.handleWebhook(request, env);
    }
    
    // Setup webhook
    if (request.url.endsWith('/setup')) {
      await adapter.setupWebhook('https://your-worker.your-subdomain.workers.dev/webhook', env);
      return new Response('Webhook set up successfully');
    }
    
    return new Response('Bot is running');
  },
};
```

## State Management

### Workers KV

Use Workers KV for simple key-value storage:

```typescript
import { BotStateKV } from 'telegram-bot-cloudflare-worker';

// In your handler
updateHandler.onMessage(async (ctx) => {
  const kv = new BotStateKV(env.BOT_STATE);
  
  // Get user state
  const userState = await kv.getUserState(ctx.update.message!.from!.id);
  
  // Update user state
  await kv.setUserState(ctx.update.message!.from!.id, {
    lastMessage: ctx.update.message!.text,
    messageCount: (userState?.messageCount || 0) + 1,
  });
});
```

### Durable Objects

Use Durable Objects for complex stateful operations:

```typescript
import { BotSessionDurableObject } from 'telegram-bot-cloudflare-worker';

export class UserSession extends BotSessionDurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/increment') {
      const count = (await this.getSessionData('count')) || 0;
      await this.setSessionData('count', count + 1);
      return new Response(JSON.stringify({ count: count + 1 }));
    }
    
    return new Response('Not found', { status: 404 });
  }
}

// In wrangler.toml
// [durable_objects]
// bindings = [
//   { name = "USER_SESSIONS", class_name = "UserSession" }
// ]
```

## Middleware

### Built-in Middleware

#### Authentication

```typescript
import { auth, adminOnly, privateOnly } from 'telegram-bot-cloudflare-worker';

// Basic auth
updateHandler.use(auth({
  allowedUsers: [123456789],
  allowedChats: [-1001234567890],
  sendDeniedMessage: true,
}));

// Admin only
updateHandler.use(adminOnly([123456789]));

// Private chats only
updateHandler.use(privateOnly());
```

#### Logging

```typescript
import { logger } from 'telegram-bot-cloudflare-worker';

updateHandler.use(logger({
  logLevel: 'info', // 'debug', 'info', 'error'
}));
```

#### Command Parsing

```typescript
import { commandParser } from 'telegram-bot-cloudflare-worker';

updateHandler.use(commandParser());

updateHandler.onMessage(async (ctx) => {
  if (ctx.command === 'start') {
    // Handle /start command
  }
});
```

### Custom Middleware

```typescript
// Rate limiting middleware
function rateLimitMiddleware(maxRequests: number, windowMs: number) {
  const requests = new Map<number, number[]>();
  
  return async (ctx, next) => {
    const userId = ctx.update.message?.from?.id;
    if (!userId) return next();
    
    const now = Date.now();
    const userRequests = requests.get(userId) || [];
    
    // Remove old requests
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      await ctx.client.sendMessage({
        chat_id: ctx.update.message!.chat.id,
        text: 'Rate limit exceeded. Please try again later.',
      });
      return;
    }
    
    validRequests.push(now);
    requests.set(userId, validRequests);
    
    await next();
  };
}

updateHandler.use(rateLimitMiddleware(10, 60000)); // 10 requests per minute
```

## Utilities

### Keyboard Builders

```typescript
import { InlineKeyboardBuilder, ReplyKeyboardBuilder } from 'telegram-bot-cloudflare-worker';

// Inline keyboard
const inlineKeyboard = new InlineKeyboardBuilder()
  .url('Visit Website', 'https://example.com')
  .callback('Click Me', 'button_clicked')
  .row()
  .callback('Option 1', 'opt1')
  .callback('Option 2', 'opt2')
  .build();

// Reply keyboard
const replyKeyboard = new ReplyKeyboardBuilder()
  .text('Button 1')
  .text('Button 2')
  .row()
  .requestContact('Share Contact')
  .requestLocation('Share Location')
  .resize()
  .oneTime()
  .build();
```

### Text Formatting

```typescript
import { format, boldHTML, italicMarkdownV2 } from 'telegram-bot-cloudflare-worker';

// Fluent API
const formatted = format('Hello, World!', 'HTML')
  .bold()
  .italic()
  .toString();

// Direct functions
const bold = boldHTML('Important text');
const italic = italicMarkdownV2('Emphasized text');
```

### File Handling

```typescript
import { createFileHelper } from 'telegram-bot-cloudflare-worker';

const fileHelper = createFileHelper(client, 'YOUR_BOT_TOKEN');

// Download file
const fileBuffer = await fileHelper.downloadFile('BAADBAADrwADBREAAYdaAAE');

// Create file from text
const textFile = fileHelper.createInputFileFromText('Hello, World!', 'hello.txt');

// Send file
await client.sendDocument({
  chat_id: 123456789,
  document: textFile,
});
```

## Environment Variables

Configure your bot using environment variables in Cloudflare Workers:

```bash
# Required
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Optional
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret
TELEGRAM_API_URL=https://api.telegram.org  # Custom API URL
```

In `wrangler.toml`:

```toml
name = "my-telegram-bot"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
TELEGRAM_API_URL = "https://api.telegram.org"

[[kv_namespaces]]
binding = "BOT_STATE"
id = "your_kv_namespace_id"

[durable_objects]
bindings = [
  { name = "USER_SESSIONS", class_name = "UserSession" }
]
```

## Deployment

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create KV Namespace

```bash
wrangler kv:namespace create "BOT_STATE"
```

### 4. Update wrangler.toml

Add the KV namespace ID to your `wrangler.toml`.

### 5. Set Secrets

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_WEBHOOK_SECRET
```

### 6. Deploy

```bash
wrangler deploy
```

### 7. Set Webhook

Visit `https://your-worker.your-subdomain.workers.dev/setup` to configure the webhook.

## Examples

### Echo Bot

```typescript
import { createBot, createWorkerHandler } from 'telegram-bot-cloudflare-worker';

const { client, updateHandler, adapter } = createBot({
  token: 'YOUR_BOT_TOKEN',
});

updateHandler.onMessage(async (ctx) => {
  const message = ctx.update.message!;
  
  if (message.text) {
    await ctx.client.sendMessage({
      chat_id: message.chat.id,
      text: `You said: ${message.text}`,
    });
  }
});

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const handler = createWorkerHandler(adapter);
    return handler(request, env, ctx);
  },
};
```

### Weather Bot

```typescript
import { 
  createBot, 
  createWorkerHandler, 
  createCommandRouter,
  format 
} from 'telegram-bot-cloudflare-worker';

const { client, updateHandler, adapter } = createBot({
  token: 'YOUR_BOT_TOKEN',
});

const router = createCommandRouter();

router.command({
  command: 'weather',
  description: 'Get weather for a city',
  requiresArgs: true,
  handler: async (ctx) => {
    const city = ctx.args.join(' ');
    
    try {
      // Fetch weather data (example)
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_API_KEY&units=metric`);
      const data = await response.json();
      
      const weather = format(`Weather in ${data.name}:`, 'HTML')
        .bold()
        .toString() + '\n\n' +
        `Temperature: ${data.main.temp}°C\n` +
        `Description: ${data.weather[0].description}\n` +
        `Humidity: ${data.main.humidity}%`;
      
      await ctx.client.sendMessage({
        chat_id: ctx.update.message!.chat.id,
        text: weather,
        parse_mode: 'HTML',
      });
    } catch (error) {
      await ctx.client.sendMessage({
        chat_id: ctx.update.message!.chat.id,
        text: 'Sorry, I could not fetch the weather data.',
      });
    }
  },
});

updateHandler.use(router.middleware());

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const handler = createWorkerHandler(adapter);
    return handler(request, env, ctx);
  },
};
```

## API Reference

### TelegramClient

The main client for interacting with the Telegram Bot API.

#### Constructor

```typescript
new TelegramClient(config: TelegramClientConfig)
```

#### Methods

All Telegram Bot API methods are available with full TypeScript support:

- `getMe()` - Get bot information
- `sendMessage(params)` - Send text message
- `sendPhoto(params)` - Send photo
- `sendDocument(params)` - Send document
- `editMessageText(params)` - Edit message text
- `deleteMessage(params)` - Delete message
- And many more...

### UpdateHandler

Manages incoming updates and middleware.

#### Methods

- `use(middleware)` - Add middleware
- `onMessage(handler)` - Handle messages
- `onCallbackQuery(handler)` - Handle callback queries
- `onInlineQuery(handler)` - Handle inline queries
- `processUpdate(update, client)` - Process an update

### CloudflareWorkersAdapter

Integrates with Cloudflare Workers.

#### Methods

- `handleWebhook(request, env)` - Handle webhook requests
- `setupWebhook(url, env, options)` - Set up webhook
- `removeWebhook(dropPendingUpdates)` - Remove webhook
- `getWebhookInfo()` - Get webhook information

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/your-repo/docs)
- 🐛 [Issue Tracker](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)
- 📧 [Email Support](mailto:support@example.com)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

---

Made with ❤️ by [Manus AI](https://github.com/manus-ai)

