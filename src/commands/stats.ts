import {Client, Message, MessageEmbed} from 'discord.js'
import { Command } from '../command'
import { db, denormalizeId, Dir, getAll, getUser, setScore, User } from '../db'
import {log, error} from '../log'
import GraphemeSplitter from 'grapheme-splitter'

/**
 * resolves ids from the database into discord tags
 */
const resolveIds = async (client: Client, ids: string[]) =>
  (await Promise.all(
    ids
      .map(denormalizeId)
      .map(id => client.users.fetch(id))
  ))
    .map(user => user.tag)

const getUsers = async (client: Client, users: User[]) => {
  const ids = users.map(user => user.id)
  const resolved = await resolveIds(client, ids)
  return [...Array(ids.length)].map((_, i) => ({score: users[i].score, tag: resolved[i]}))
}

type Unpack<T> = T extends Promise<infer U> ? U : T

const length = (s: string) => new GraphemeSplitter().countGraphemes(s)

const repeat = (s: string, n: number) => n > 1 ? s.repeat(n) : ''

const pad = (s: string, l: number) => s + repeat(' ', l - length(s))

const format = (users: Unpack<ReturnType<typeof getUsers>>) => {
  const longest = users
    .map(({tag}) => tag)
    .sort((a, b) => length(b) - length(a))
  const width = length(longest[0]) + 6
  return users.map(({tag, score}, i) => `${pad(`${i + 1}. ${tag}`, width)} ${score} points`)
}

const top = async (message: Message) => {
  const results = getAll(Dir.Top)
  if(!results) {
    return message.channel.send(':warning: couldn\'t fetch top users')
  }
  const users = await getUsers(message.client, results)
  const embed = new MessageEmbed()
  embed.setTitle('The best model citizens')
  embed.setThumbnail('https://media1.tenor.com/images/2e822608bd561bd3923133872d22857f/tenor.gif?itemid=16580646')
  users.forEach((user, i) => embed.addField(`${i + 1}. ${user.tag}`, user.score + ' points', true))
  embed.setColor(0xf1c40f)
  embed.setTimestamp()
  message.channel.send(embed)
}

const bottom = async (message: Message) => {
  const results = getAll(Dir.Bottom)
  if(!results) {
    return message.channel.send(':warning: couldn\'t fetch bottom users')
  }
  const users = await getUsers(message.client, results)
  const embed = new MessageEmbed()
  embed.setTitle('The most evil counter-revolutionaries')
  embed.setThumbnail('https://media1.tenor.com/images/2a139cd34a7b8d4e4d601de597d01c46/tenor.gif?itemid=21379187')
  users.forEach((user, i) => embed.addField(`${i + 1}. ${user.tag}`, user.score + ' points', true))
  embed.setColor(0xf1c40f)
  embed.setTimestamp()
  message.channel.send(embed)
}

const mention = async (message: Message) => {
  const mentioned = message.mentions.users.first()
  if(!mentioned) {
    return error('couldnt find mentioned person')
  } else if(mentioned.id === message.client.user?.id) {
    return message.channel.send('i have like a billion points lmao')
  }
  const user = getUser(mentioned.id)
  if(!user) {
    setScore(mentioned.id, 0)
    message.channel.send(`${mentioned.tag} has 0 points.`)
  } else {
    message.channel.send(`${mentioned.tag} has ${user.score} points.`)
  }
}

class Stats extends Command {
  constructor() {
    super('stats', 'gets stats for people', ['sml stats top', 'sml stats @autumn'])
  }

  async run (message: Message, argv: string[]) {
    const subcommand = argv.shift()
    if(!subcommand) {
      message.channel.send(':warning: no target specified - you can check ' +
                           '`top`, `bottom`, or mention someone to see their' +
                           'stats')
    } else if(subcommand === 'top') {
      top(message)
    } else if(subcommand === 'bottom') {
      bottom(message)
    } else if(subcommand.startsWith('<@!')) {
      mention(message)
    }
  }
}

export const stats = new Stats()
