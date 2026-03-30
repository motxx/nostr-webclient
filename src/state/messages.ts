import { atom } from 'jotai'
import { Conversation } from '@/domain/entities/Conversation'

export const conversationsAtom = atom<Conversation[]>([])
