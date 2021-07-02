import {Message} from 'discord.js'
import { Command } from '../command'

class Hi extends Command {
  constructor() {
    super('hi', 'says hi', ['sml hi'])
  }
  run(message: Message) {
    message.channel.send('hi')
  }
}

export const hi = new Hi()
