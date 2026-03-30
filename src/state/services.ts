import { atom } from 'jotai'
import { nostrClientAtom } from './auth'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { NoteService } from '@/infrastructure/services/NoteService'
import { NotificationService } from '@/infrastructure/services/NotificationService'
import { PublicChatService } from '@/infrastructure/services/PublicChatService'
import { DirectMessageService } from '@/infrastructure/services/DirectMessageService'
import { UserService } from '@/infrastructure/services/UserService'

export const userProfileServiceAtom = atom((get) => {
  const client = get(nostrClientAtom)
  return client ? new UserProfileService(client) : null
})

export const noteServiceAtom = atom((get) => {
  const client = get(nostrClientAtom)
  const userProfileService = get(userProfileServiceAtom)
  return client && userProfileService
    ? new NoteService(client, userProfileService)
    : null
})

export const notificationServiceAtom = atom((get) => {
  const client = get(nostrClientAtom)
  const userProfileService = get(userProfileServiceAtom)
  const noteService = get(noteServiceAtom)
  return client && userProfileService && noteService
    ? new NotificationService(client, userProfileService, noteService)
    : null
})

export const publicChatServiceAtom = atom((get) => {
  const client = get(nostrClientAtom)
  const userProfileService = get(userProfileServiceAtom)
  return client && userProfileService
    ? new PublicChatService(client, userProfileService)
    : null
})

export const directMessageServiceAtom = atom((get) => {
  const client = get(nostrClientAtom)
  return client ? new DirectMessageService(client) : null
})

export const userServiceAtom = atom((get) => {
  const client = get(nostrClientAtom)
  return client ? new UserService(client) : null
})
