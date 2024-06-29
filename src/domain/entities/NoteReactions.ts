export class NoteReactions {
  constructor(
    public readonly id: string,
    public readonly noteId: string,
    public readonly userId: string,
    public readonly reaction: string
  ) {}
}
