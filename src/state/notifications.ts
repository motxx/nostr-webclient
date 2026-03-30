import { atom } from 'jotai'
import { Notification } from '@/domain/entities/Notification'

export const notificationsAtom = atom<Notification[]>([])
export const notificationsLoadingAtom = atom(true)
