import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import UserHeader from './components/UserHeader'
import UserDescription from './components/UserDescription'
import UserContents from './components/UserContents'
import { User } from '@/domain/entities/User'
import { ResultAsync } from 'neverthrow'
import { bech32ToHex } from '@/utils/addressConverter'
import { useAtomValue } from 'jotai'
import { AuthStatus, authStatusAtom, loggedInUserAtom } from '@/state/auth'
import { userProfileServiceAtom } from '@/state/services'

const UserPage: React.FC = () => {
  const authStatus = useAtomValue(authStatusAtom)
  const loggedInUser = useAtomValue(loggedInUserAtom)
  const userProfileService = useAtomValue(userProfileServiceAtom)
  const [user, setUser] = useState<User | null>(null)
  const location = useLocation()

  useEffect(() => {
    if (authStatus !== AuthStatus.LoggedIn) return
    if (!userProfileService || !loggedInUser) return

    const fetchUserData = () => {
      const npubPattern = new RegExp('/user/(npub[^/]+)/?')
      const npubMatch = location.pathname.match(npubPattern)

      const getNpub = (): ResultAsync<string, Error> => {
        if (npubMatch) {
          return ResultAsync.fromSafePromise(Promise.resolve(npubMatch[1]))
        } else {
          const nostrAddressPattern = new RegExp('/user/([^/]*@[^/]+)/?')
          const nostrAddressMatch = location.pathname.match(nostrAddressPattern)
          if (!nostrAddressMatch) {
            return ResultAsync.fromSafePromise(
              Promise.reject(new Error('Invalid URL'))
            )
          }

          let nostrAddress = nostrAddressMatch[1]
          if (nostrAddress.startsWith('@')) {
            nostrAddress = `_${nostrAddress}`
          }
          return userProfileService.fetchNpubFromNostrAddress(nostrAddress)
        }
      }

      getNpub()
        .andThen((npub) =>
          userProfileService
            .fetchProfile(npub)
            .andThen((profile) =>
              bech32ToHex(npub).map(
                (pubkey) => new User({ npub, pubkey, profile })
              )
            )
        )
        .match(
          (user) => setUser(user),
          (error) => console.error('Failed to fetch user data:', error)
        )
    }

    fetchUserData()
  }, [authStatus, userProfileService, loggedInUser, location.pathname])

  if (!user) return <div>Loading...</div>

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <UserHeader user={user} />
      <div className="w-full">
        <div className="px-2 sm:px-6 pt-2 pb-10 sm:pt-6">
          <UserDescription user={user} />
        </div>
        <div className="w-full flex flex-col items-start">
          <UserContents user={user} />
        </div>
      </div>
    </div>
  )
}

export default UserPage
