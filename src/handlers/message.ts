import { Message } from 'discord.js'
import { log } from '../log'
import seedrandom from 'seedrandom'
import { commands } from '../commands'
import {handleError} from '../util'
import {Eval} from '../commands/eval'

const questions = [
  'is', 'does', 'can', 'will', 'do', 'can\'t', 'am', 'are', 'should', 'would'
]

const yesno = (message: Message) => {
      const rng = seedrandom(message.content)
      const i = rng.int32() % 3
      const response = ['yes', 'no', 'maybe'][i]
      message.channel.send(response || 'maybe')

}

const evall = new Eval()

/**
 * Handles incoming messages.
 */
export const messageHandler = async (message: Message) => {
  if (message.content.startsWith('sml ')) {
    const argv = message.content.split(' ')
    argv.shift()

    // yes/no questions
    if(questions.includes(argv[0])) yesno(message)

    else if(argv[0] === 'help') {}

    else if(argv[0] === 'eval') {
      log('hi')
      argv.shift()
      evall.run(message, argv)
    }

    else if(commands.hasOwnProperty(argv[0])) {
      const command = commands[argv.shift()!]
      try {
        await command.run(message, argv)
      } catch (e) {
        handleError(message.channel, e)
      }
    }
  }
}
