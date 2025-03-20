import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { FetchPastNotes } from '@/domain/use_cases/FetchPastNotes'
import { Note } from '@/domain/entities/Note'
import { SubscribeNotesOptions } from '@/domain/repositories/NoteRepository'
import { RootState } from '@/state/store'
import { NoteRepository } from '@/domain/repositories/NoteRepository'

export interface TimelineState {
  notes: Note[]
  loading: boolean
  error: string | null
}

const initialState: TimelineState = {
  notes: [],
  loading: false,
  error: null,
}

export const fetchPastNotes = createAsyncThunk<
  Note[],
  SubscribeNotesOptions | undefined,
  {
    state: RootState
    rejectValue: string
    extra: { noteRepository: NoteRepository }
  }
>('timeline/fetchPastNotes', async (options, thunkAPI) => {
  try {
    return await new FetchPastNotes(thunkAPI.extra.noteRepository)
      .execute(options ?? {})
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPastNotes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchPastNotes.fulfilled,
        (state, action: PayloadAction<Note[]>) => {
          state.loading = false
          state.notes = action.payload
        }
      )
      .addCase(fetchPastNotes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to fetch past notes'
      })
  },
})

export const { clearNotes } = timelineSlice.actions
export default timelineSlice.reducer
