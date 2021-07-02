import {Message} from 'discord.js'
import { Command } from '../command'
import {log} from '../log'
import {isOwner} from '../permissions'
import {handleError, sendSafe} from '../util'
import {inspect} from 'util'

export class Eval extends Command {
  constructor() {
    super('eval', 'evaluates javascript', ['sml eval 9 + 10'])
  }
  async run(message: Message, argv: string[]) {
    if(!isOwner(message)) {
      message.channel.send('https://en.wiktionary.org/wiki/whore')
    } else {
      log('hello')
      try {
        const result = eval(argv.join(' '))
        log(result)
        sendSafe(message.channel, inspect(result))
      } catch(e) {
        handleError(message.channel, e)
      }
    }
  }
}

