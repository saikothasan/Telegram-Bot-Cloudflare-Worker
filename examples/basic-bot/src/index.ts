/**
 * Basic Telegram Bot Example for Cloudflare Workers
 * 
 * This example demonstrates:
 * - Basic bot setup
 * - Message handling
 * - Command processing
 * - Webhook integration
 */

import { 
  createBot, 
  createWorkerHandler,
  createCommandRouter,
  logger,
  InlineKeyboardBuilder,
  format
} from 'telegram-bot-cloudflare-worker';

// Environment interface
interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  BOT_STATE?: KVNamespace;
}

// Create bot instance
const { client, updateHandler, adapter } = createBot({
  token: '', // Will be set from environment
});

// Add logging middleware
updateHandler.use(logger({ logLevel: 'info' }));

// Create command router
const router = createCommandRouter();

// Start command
router.command({
  command: 'start',
  description: 'Start the bot and show welcome message',
  handler: async (ctx) => {
    const user = ctx.update.message!.from!;
    const welcomeText = format(`Hello, ${user.first_name}!`, 'HTML').bold().toString() + 
      '\n\nWelcome to the Basic Telegram Bot example. Here are the available commands:\n\n' +
      '/help - Show this help message\n' +
      '/echo <text> - Echo your message\n' +
      '/time - Get current time\n' +
      '/keyboard - Show inline keyboard example';

    const keyboard = new InlineKeyboardBuilder()
      .callback('📚 Help', 'help')
      .callback('⏰ Time', 'time')
      .row()
      .url('🌐 GitHub', 'https://github.com/your-repo')
      .build();

    await ctx.client.sendMessage({
      chat_id: ctx.update.message!.chat.id,
      text: welcomeText,
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  },
});

// Help command
router.command({
  command: 'help',
  description: 'Show help information',
  handler: async (ctx) => {
    const helpText = router.generateHelp();
    
    await ctx.client.sendMessage({
      chat_id: ctx.update.message!.chat.id,
      text: helpText,
    });
  },
});

// Echo command
router.command({
  command: 'echo',
  description: 'Echo your message',
  requiresArgs: true,
  validationMessage: 'Please provide a message to echo. Usage: /echo <your message>',
  handler: async (ctx) => {
    const text = ctx.args.join(' ');
    const echoText = format('You said:', 'MarkdownV2').italic().toString() + 
      '\n\n' + format(text, 'MarkdownV2').bold().toString();

    await ctx.client.sendMessage({
      chat_id: ctx.update.message!.chat.id,
      text: echoText,
      parse_mode: 'MarkdownV2',
    });
  },
});

// Time command
router.command({
  command: 'time',
  description: 'Get current time',
  handler: async (ctx) => {
    const now = new Date();
    const timeText = format('Current time:', 'HTML').bold().toString() + 
      `\n\n🕐 ${now.toLocaleString('en-US', { 
        timeZone: 'UTC',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      })}`;

    await ctx.client.sendMessage({
      chat_id: ctx.update.message!.chat.id,
      text: timeText,
      parse_mode: 'HTML',
    });
  },
});

// Keyboard command
router.command({
  command: 'keyboard',
  description: 'Show inline keyboard example',
  handler: async (ctx) => {
    const keyboard = new InlineKeyboardBuilder()
      .callback('🔴 Red', 'color:red')
      .callback('🟢 Green', 'color:green')
      .callback('🔵 Blue', 'color:blue')
      .row()
      .callback('🎲 Random', 'random')
      .callback('❌ Close', 'close')
      .build();

    await ctx.client.sendMessage({
      chat_id: ctx.update.message!.chat.id,
      text: '🎨 Choose a color or action:',
      reply_markup: keyboard,
    });
  },
});

// Use command router
updateHandler.use(router.middleware());

// Handle callback queries
updateHandler.onCallbackQuery(async (ctx) => {
  const query = ctx.update.callback_query!;
  const data = query.data!;

  try {
    if (data === 'help') {
      const helpText = router.generateHelp();
      
      await ctx.client.answerCallbackQuery({
        callback_query_id: query.id,
        text: 'Help information sent!',
      });

      await ctx.client.sendMessage({
        chat_id: query.message!.chat.id,
        text: helpText,
      });
    } else if (data === 'time') {
      const now = new Date();
      
      await ctx.client.answerCallbackQuery({
        callback_query_id: query.id,
        text: `Current time: ${now.toLocaleTimeString()}`,
        show_alert: true,
      });
    } else if (data.startsWith('color:')) {
      const color = data.split(':')[1];
      const colorEmojis = {
        red: '🔴',
        green: '🟢',
        blue: '🔵',
      };
      
      await ctx.client.answerCallbackQuery({
        callback_query_id: query.id,
        text: `You selected ${color}!`,
      });

      await ctx.client.editMessageText({
        chat_id: query.message!.chat.id,
        message_id: query.message!.message_id,
        text: `${colorEmojis[color as keyof typeof colorEmojis]} You selected ${color}!`,
      });
    } else if (data === 'random') {
      const randomNumber = Math.floor(Math.random() * 100) + 1;
      
      await ctx.client.answerCallbackQuery({
        callback_query_id: query.id,
        text: `Random number: ${randomNumber}`,
        show_alert: true,
      });
    } else if (data === 'close') {
      await ctx.client.answerCallbackQuery({
        callback_query_id: query.id,
        text: 'Closed!',
      });

      await ctx.client.deleteMessage({
        chat_id: query.message!.chat.id,
        message_id: query.message!.message_id,
      });
    }
  } catch (error) {
    console.error('Error handling callback query:', error);
    
    await ctx.client.answerCallbackQuery({
      callback_query_id: query.id,
      text: 'An error occurred. Please try again.',
    });
  }
});

// Handle regular messages (non-commands)
updateHandler.onMessage(async (ctx) => {
  const message = ctx.update.message!;
  
  // Skip if it's a command (already handled by router)
  if (message.text?.startsWith('/')) {
    return;
  }

  // Handle different message types
  if (message.text) {
    // Echo text messages with some formatting
    const responseText = format('You sent:', 'HTML').italic().toString() + 
      ` "${message.text}"\n\n` +
      'Try using /help to see available commands!';

    await ctx.client.sendMessage({
      chat_id: message.chat.id,
      text: responseText,
      parse_mode: 'HTML',
    });
  } else if (message.photo) {
    // Handle photo messages
    await ctx.client.sendMessage({
      chat_id: message.chat.id,
      text: '📸 Nice photo! I can see you sent an image.',
    });
  } else if (message.document) {
    // Handle document messages
    await ctx.client.sendMessage({
      chat_id: message.chat.id,
      text: `📄 You sent a document: ${message.document.file_name || 'Unknown file'}`,
    });
  } else if (message.voice) {
    // Handle voice messages
    await ctx.client.sendMessage({
      chat_id: message.chat.id,
      text: '🎤 I received your voice message!',
    });
  } else if (message.location) {
    // Handle location messages
    await ctx.client.sendMessage({
      chat_id: message.chat.id,
      text: `📍 Thanks for sharing your location!\nLatitude: ${message.location.latitude}\nLongitude: ${message.location.longitude}`,
    });
  } else {
    // Handle other message types
    await ctx.client.sendMessage({
      chat_id: message.chat.id,
      text: '🤖 I received your message! Use /help to see what I can do.',
    });
  }
});

// Cloudflare Worker export
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Set bot token from environment
    const botToken = env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return new Response('Bot token not configured', { status: 500 });
    }

    // Update client configuration
    (client as any).apiUrl = `https://api.telegram.org/bot${botToken}`;

    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    // Setup webhook endpoint
    if (url.pathname === '/setup') {
      try {
        const webhookUrl = `${url.origin}/webhook`;
        await adapter.setupWebhook(webhookUrl, env, {
          dropPendingUpdates: true,
        });
        
        return new Response(`Webhook set up successfully: ${webhookUrl}`, { status: 200 });
      } catch (error) {
        console.error('Error setting up webhook:', error);
        return new Response('Failed to set up webhook', { status: 500 });
      }
    }

    // Webhook endpoint
    if (url.pathname === '/webhook') {
      return adapter.handleWebhook(request, env);
    }

    // Bot info endpoint
    if (url.pathname === '/info') {
      try {
        const botInfo = await client.getMe();
        return new Response(JSON.stringify(botInfo, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error getting bot info:', error);
        return new Response('Failed to get bot info', { status: 500 });
      }
    }

    // Default response
    return new Response(`
      <h1>Basic Telegram Bot</h1>
      <p>Bot is running successfully!</p>
      <ul>
        <li><a href="/health">Health Check</a></li>
        <li><a href="/info">Bot Info</a></li>
        <li><a href="/setup">Setup Webhook</a></li>
      </ul>
      <p>Start a chat with your bot on Telegram and send /start to begin!</p>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  },
};

