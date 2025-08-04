import type { Middleware, Context } from '../UpdateHandler';

/**
 * Command handler function
 */
export type CommandHandler = (ctx: Context & { 
  command: string; 
  args: string[]; 
  botUsername?: string; 
}) => Promise<void>;

/**
 * Command configuration
 */
export interface CommandConfig {
  /** Command name (without /) */
  command: string;
  /** Command description for help */
  description?: string;
  /** Command handler function */
  handler: CommandHandler;
  /** Command aliases */
  aliases?: string[];
  /** Minimum number of arguments */
  minArgs?: number;
  /** Maximum number of arguments */
  maxArgs?: number;
  /** Whether command matching is case-insensitive */
  ignoreCase?: boolean;
}

/**
 * Command router class
 */
export class CommandRouter {
  private commandMap = new Map<string, CommandConfig>();
  private defaultHandler?: CommandHandler;
  private unknownCommandHandler?: CommandHandler;
  private helpCommand = 'help';

  /**
   * Register a command
   */
  command(config: CommandConfig): this {
    const commandName = config.ignoreCase ? config.command.toLowerCase() : config.command;
    this.commandMap.set(commandName, config);

    // Register aliases
    if (config.aliases) {
      for (const alias of config.aliases) {
        const aliasName = config.ignoreCase ? alias.toLowerCase() : alias;
        this.commandMap.set(aliasName, config);
      }
    }

    return this;
  }

  /**
   * Register multiple commands at once
   */
  commands(configs: CommandConfig[]): this {
    for (const config of configs) {
      this.command(config);
    }
    return this;
  }

  /**
   * Set default handler for non-command messages
   */
  default(handler: CommandHandler): this {
    this.defaultHandler = handler;
    return this;
  }

  /**
   * Set handler for unknown commands
   */
  unknown(handler: CommandHandler): this {
    this.unknownCommandHandler = handler;
    return this;
  }

  /**
   * Set help command name
   */
  help(command: string): this {
    this.helpCommand = command;
    return this;
  }

  /**
   * Generate help text
   */
  generateHelp(): string {
    const commands = Array.from(this.commandMap.values())
      .filter(cmd => cmd.description)
      .map(cmd => `/${cmd.command} - ${cmd.description}`)
      .join('\n');

    return commands || 'No commands available.';
  }

  /**
   * Create middleware function
   */
  middleware(): Middleware {
    return async (ctx, next) => {
      if (!ctx.command) {
        if (this.defaultHandler) {
          await this.defaultHandler(ctx as any);
        } else {
          await next();
        }
        return;
      }

      // Handle help command
      if (ctx.command === this.helpCommand) {
        const helpText = this.generateHelp();
        if (ctx.update.message) {
          await ctx.client.sendMessage({
            chat_id: ctx.update.message.chat.id,
            text: helpText,
          });
        }
        return;
      }

      // Find and execute command
      const commandConfig = this.commandMap.get(ctx.command);
      if (commandConfig) {
        // Validate arguments if required
        if (commandConfig.minArgs && (!ctx.args || ctx.args.length < commandConfig.minArgs)) {
          if (ctx.update.message) {
            await ctx.client.sendMessage({
              chat_id: ctx.update.message.chat.id,
              text: `Command /${ctx.command} requires at least ${commandConfig.minArgs} arguments.`,
            });
          }
          return;
        }

        if (commandConfig.maxArgs && ctx.args && ctx.args.length > commandConfig.maxArgs) {
          if (ctx.update.message) {
            await ctx.client.sendMessage({
              chat_id: ctx.update.message.chat.id,
              text: `Command /${ctx.command} accepts at most ${commandConfig.maxArgs} arguments.`,
            });
          }
          return;
        }

        await commandConfig.handler(ctx as any);
      } else if (this.unknownCommandHandler) {
        await this.unknownCommandHandler(ctx as any);
      } else {
        // Default unknown command response
        if (ctx.update.message) {
          await ctx.client.sendMessage({
            chat_id: ctx.update.message.chat.id,
            text: `Unknown command: /${ctx.command}. Type /${this.helpCommand} for available commands.`,
          });
        }
      }
    };
  }
}

/**
 * Create a new command router
 */
export function createCommandRouter(): CommandRouter {
  return new CommandRouter();
}

