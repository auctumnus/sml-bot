import {Command} from '../command'
import { hi } from './hi'
import { stats } from './stats'

export const commands: Record<string, Command> = {
  hi, stats
}
