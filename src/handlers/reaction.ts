import {Collection, MessageReaction, PartialUser, User} from "discord.js";
import { getUser, setScore } from '../db'

const positive = ['👍', '⭐']
const negative = ['👎', '🐀']
const votes = [...positive, ...negative]

const getVotes = (reaction: MessageReaction) =>
  reaction.message.reactions.cache.filter((react) => votes.includes(react.emoji.name))

const resolveUsers = async (reactions: Collection<string, MessageReaction>) =>
  await Promise.all(reactions.map((reacted: MessageReaction) => reacted.users.fetch()))

const didVote = async (reaction: MessageReaction, user: User) => {
  const reactions = await resolveUsers(getVotes(reaction))

  return reactions.every(users => users.every(reactedUser => reactedUser.id !== user.id))
}

const getEffect = (reaction: MessageReaction) =>
  positive.includes(reaction.emoji.name) ? 1 :
  negative.includes(reaction.emoji.name) ? -1 : 0

const fetchReaction = async (reaction: MessageReaction) => {
  try {
    if(reaction.message.partial) await reaction.message.fetch()
    if(reaction.partial) await reaction.fetch()
    return true
  } catch (e) {
    return false
  }
}

export const messageReactionAdd = async (reaction: MessageReaction, user: User | PartialUser) => {
  if(!fetchReaction(reaction)) return undefined

  const effect = getEffect(reaction)
  if(!effect) return undefined

  if(
    // if the person who made this reaction is the author...
    reaction.message.author.id === user.id ||
    // or if they've already voted on this message...
    await didVote(reaction, user as User)
  ) {
    // exit early
    return undefined
  }

  const reactedUser = reaction.message.author

  // otherwise, the vote is good - let's go change the score of whoever got reacted to
  const fromDb = getUser(reactedUser.id)

  // get the score - if the user doesn't exist yet, then their score is 0
  const score = fromDb ? fromDb.score : 0

  setScore(reactedUser.id, score + effect)
}

// only diff between this and add is that this inverts the effect
export const messageReactionRemove = async (reaction: MessageReaction, user: User | PartialUser) => {
  if(!fetchReaction(reaction)) return undefined

  const effect = -getEffect(reaction)
  if(!effect) return undefined

  if(reaction.message.author.id === user.id || await didVote(reaction, user as User)) {
    return undefined
  }

  const reactedUser = reaction.message.author

  // otherwise, the vote is good - let's go change the score of whoever got reacted to
  const fromDb = getUser(reactedUser.id)

  // get the score - if the user doesn't exist yet, then their score is 0
  const score = fromDb ? fromDb.score : 0

  setScore(reactedUser.id, score + effect)
}

