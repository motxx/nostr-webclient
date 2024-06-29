export interface NoteReactionsType {
  likesCount: number
  repostsCount: number
  zapsAmount: number
  customReactions: { [key: string]: number }
}

export class NoteReactions implements NoteReactionsType {
  public readonly likesCount: number = 0
  public readonly repostsCount: number = 0
  public readonly zapsAmount: number = 0
  public readonly customReactions: { [key: string]: number } = {}

  constructor(data: NoteReactionsType) {
    Object.assign(this, data)
  }
}
