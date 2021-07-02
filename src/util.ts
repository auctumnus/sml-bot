import {DMChannel, NewsChannel, TextChannel} from "discord.js";
import {log} from "./log";

type Channel = TextChannel | DMChannel | NewsChannel

/**
 * maximum length - 2k character limit, minus 6 for ```s
 */
const MAX_SAFE = 2000 - 6
/**
 * ms to wait between long messages
 */
const WAIT = 200

const sendSafePart = async (channel: Channel, message: string) => {
  if(!message.length) return undefined
  await channel.send('```' + message.substr(0, MAX_SAFE) + '```')
  if(message.length) {
    setTimeout(() => sendSafePart(channel, message.substr(MAX_SAFE)), WAIT)
  }
}

export const sendSafe = async (channel: Channel, message: string) => {
  log(message)

  if(message.length < MAX_SAFE) {
    log('sending')
    await channel.send('```' + message + '```')
  } else {
    sendSafePart(channel, message)
  }
}

export const handleError = async (channel: Channel, err: Error) => {
  await channel.send(':warning: got an error:')
  await sendSafe(channel, err + '')
}
