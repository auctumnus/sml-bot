import 'dotenv/config'

import Discord, {ActivityType} from 'discord.js'
import { log, error } from './log'
import { messageHandler } from './handlers/message'
import {messageReactionAdd, messageReactionRemove} from './handlers/reaction'
import statusesjson from './statuses.json'
import sample from '@stdlib/random-sample'

const statuses = statusesjson as string[][]

if (!process.env.TOKEN) {
  error('no token provided')
  process.exit(1)
}

const client = new Discord.Client({ partials: ['REACTION']})

const getRandomStatus = () => {
  const { length } = statuses
  const index = Math.floor(Math.random() * length)
  return statuses[index]
}

const getPresence = () => {
  const [type, name] = getRandomStatus()

  return {activity: {type: type.toUpperCase() as ActivityType, name}}
}

const setPresence = () => client.user?.setPresence(getPresence())

client
  .on('ready', () => log(`logged in as ${client?.user?.tag || 'someone'}`))
  .on('ready', () => client.user?.setStatus('online'))
  .on('ready', () => setPresence())
  .on('ready', () => setInterval(setPresence, 1000 * 60))
  .on('message', messageHandler)
  .on('messageReactionAdd', messageReactionAdd)
  .on('messageReactionRemove', messageReactionRemove)
  .login(process.env.TOKEN)


process.on('exit', async () => await client.user?.setStatus('invisible'))
process.on('unhandledRejection', error)
