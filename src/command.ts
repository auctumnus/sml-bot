import {Message} from "discord.js";

/**
 * Describes a command.
 */
export class Command {
  constructor (
    public name: string,
    public description: string,
    public examples: string[]
  ) {}

  run(_message: Message, _argv?: string[]): void | Promise<void> {}
}
