import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { FetchPastNotes } from '@/domain/use_cases/FetchPastNotes'
import { Note } from '@/domain/entities/Note'
import { SubscribeNotesOptions } from '@/domain/repositories/NoteRepository'
import { RootState } from '@/state/store'
import { NoteRepository } from '@/domain/repositories/NoteRepository'

export enum TimelineStatus {
  Idle = 'Idle',
  Subscribing = 'Subscribing',
  Error = 'Error',
}

export interface TimelineState {
  notes: Note[]
  status: TimelineStatus
  loading: boolean
  error: string | null
  fetchingPastNotes: boolean
}

const initialState: TimelineState = {
  notes: [],
  status: TimelineStatus.Idle,
  loading: false,
  fetchingPastNotes: false,
  error: null,
}

export const fetchPastNotes = createAsyncThunk<
  Note[],
  { options: SubscribeNotesOptions; noteService: NoteRepository },
  {
    state: RootState
    rejectValue: string
  }
>('timeline/fetchPastNotes', async ({ options, noteService }, thunkAPI) => {
  try {
    return await new FetchPastNotes(noteService)
      .execute(options)
      .match(
        (notes) => notes,
        (error) => {
          throw error
        }
      )
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    clearNotes(state) {
      state.notes = []
    },
    setStatus(state, action: PayloadAction<TimelineStatus>) {
      state.status = action.payload
    },
    addNote(state, action: PayloadAction<Note>) {
      // 重複を防ぐためにMapを使用
      const notesMap = new Map(state.notes.map((note) => [note.id, note]))
      notesMap.set(action.payload.id, action.payload)
      state.notes = [...notesMap.values()].sort(
        (a, b) => b.created_at.getTime() - a.created_at.getTime()
      )
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPastNotes.pending, (state) => {
        state.fetchingPastNotes = true
        state.error = null
      })
      .addCase(
        fetchPastNotes.fulfilled,
        (state, action: PayloadAction<Note[]>) => {
          state.fetchingPastNotes = false
          // 重複を防ぐためにMapを使用
          const notesMap = new Map([
            ...state.notes.map((note) => [note.id, note]),
            ...action.payload.map((note) => [note.id, note]),
          ])
          state.notes = [...notesMap.values()].sort(
            (a, b) => b.created_at.getTime() - a.created_at.getTime()
          )
        }
      )
      .addCase(fetchPastNotes.rejected, (state, action) => {
        state.fetchingPastNotes = false
        state.error = action.payload ?? 'Failed to fetch past notes'
      })
  },
})

export const {
  clearNotes,
  setStatus,
  addNote,
} = timelineSlice.actions

export default timelineSlice.reducer
