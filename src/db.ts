import sqlite from 'better-sqlite3'
import {error, log} from './log'

export interface User {
  id: string,
  score: number
}

export const db = sqlite('db/sml.db')
db.pragma('journal_mode = WAL')

const normalizeId = (id: string) => id.startsWith('i') ? id : 'i' + id

export const denormalizeId = (id: string) => id.startsWith('i') ? id.substr(1) : id

export const enum Dir {
  Top, Bottom
}

export const getAll = (dir: Dir) => {
  try {
    const order = dir === Dir.Top ? 'DESC' : 'ASC'
    return db.prepare('select id, score from users order by score ' + order + ' limit 10').all() as User[]
  } catch(e) {
    error('got an error while getting all scores from the database', e)
    return null
  }
}

export const getUser = (id: string) => {
  id = normalizeId(id)
  try {
    const user = db.prepare('select id, score from users where id = ?').get(id)
    if(!user) {
      return null
    } else if(typeof user.id !== 'string') {
      error('got an invalid id from the database')
      return null
    } else if(typeof user.score !== 'number') {
      error('got an invalid score from the database')
      return null
    }
    return user as User
  } catch(e) {
    error('got an error getting a user from the database', e)
    return null
  }
}

export const makeScore = (id: string, score: number) => {
  id = normalizeId(id)
  try {
    const result = db.prepare('insert into users (id, score) values (?, ?)').run(id, score)
    if(result.changes === 0) {
      return false
    } else if(result.changes === 1) {
      return true
    } else {
      error('got a weird number of changes from making a score:', result.changes)
      return false
    }
  } catch(e) {
    error('got an error inserting a score', e)
    return false
  }
}

export const setScore = (id: string, score: number) => {
  id = normalizeId(id)
  if(!getUser(id)) {
    return makeScore(id, score)
  }
  try {
    const result = db.prepare('update users set score = ? where id = ?').run(score, id)
    if(result.changes === 0) {
      return false
    } else if(result.changes === 1) {
      return true
    } else {
      error('got a weird number from setting the score (should be 0 or 1):', result.changes)
      return false
    }
  } catch(e) {
    error('got an error setting a user\'s score', e)
    return false
  }
}

