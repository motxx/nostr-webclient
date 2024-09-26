import { User } from './User'

export class Participant {
  constructor(
    public readonly user: User,
    public readonly relay?: string
  ) {}
}
