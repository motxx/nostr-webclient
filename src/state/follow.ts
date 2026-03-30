import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

export const followStatusFamily = atomFamily((_pubkey: string) => atom(false))
