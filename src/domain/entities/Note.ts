export class Note {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly imageUrl: string,
    public readonly totalZappedAmount: number
  ) {}

  static copyWithZap(note: Note, addedZap: number): Note {
    return new Note(
      note.id,
      note.text,
      note.imageUrl,
      note.totalZappedAmount + addedZap
    )
  }
}
