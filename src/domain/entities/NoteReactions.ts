export interface NoteReactionsType {
  likesCount: number
  repostsCount: number
  zapsAmount: number
}

export class NoteReactions implements NoteReactionsType {
  constructor(
    public readonly likesCount: number,
    public readonly repostsCount: number,
    public readonly zapsAmount: number
  ) {}
}
