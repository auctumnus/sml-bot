import { Message } from 'discord.js'

export const isOwner = (message: Message) =>
  message.author.id === process.env.OWNER
