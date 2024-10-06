import React, { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import UserHeader from './components/UserHeader'
import UserDescription from './components/UserDescription'
import UserContents from './components/UserContents'
import { User } from '@/domain/entities/User'
import { FetchNpubFromNostrAddress } from '@/domain/use_cases/FetchNpubFromNostrAddress'
import { FetchUser } from '@/domain/use_cases/FetchUser'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { AppContext } from '@/context/AppContext'
import { AuthStatus } from '@/context/types'
import { Observable, of, switchMap, throwError } from 'rxjs'

interface UserPageProps {
  isFollowing: boolean
  toggleFollow: (userId: string) => boolean
}

const UserPage: React.FC<UserPageProps> = ({ isFollowing, toggleFollow }) => {
  const {
    auth: { nostrClient, loggedInUser, status },
  } = useContext(AppContext)
  const [user, setUser] = useState<User | null>(null)
  const location = useLocation()

  useEffect(() => {
    if (status !== AuthStatus.LoggedIn) {
      return
    }
    if (!nostrClient || !loggedInUser) {
      throw new Error('NostrClient or loggedInUser is not ready')
    }

    const fetchUserData = () => {
      const userProfileService = new UserProfileService(nostrClient)
      const npubPattern = new RegExp('/user/(npub[^/]+)/?')
      const npubMatch = location.pathname.match(npubPattern)

      const getNpub = (): Observable<string> => {
        if (npubMatch) {
          return of(npubMatch[1])
        } else {
          const nostrAddressPattern = new RegExp('/user/([^/]*@[^/]+)/?')
          const nostrAddressMatch = location.pathname.match(nostrAddressPattern)
          if (!nostrAddressMatch) {
            return throwError(() => new Error('Invalid URL'))
          }

          let nostrAddress = nostrAddressMatch[1]
          if (nostrAddress.startsWith('@')) {
            nostrAddress = `_${nostrAddress}`
          }
          return new FetchNpubFromNostrAddress(userProfileService).execute(
            nostrAddress
          )
        }
      }

      getNpub()
        .pipe(
          switchMap((npub) => new FetchUser(userProfileService).execute(npub))
        )
        .subscribe({
          next: (user) => setUser(user),
          error: (error) => console.error('Failed to fetch user data:', error),
        })
    }

    fetchUserData()
  }, [nostrClient, loggedInUser, status, location.pathname])

  if (!user) return <div>Loading...</div>

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <UserHeader user={user} />
      <div className="w-full">
        <div className="px-2 sm:px-6 pt-2 pb-10 sm:pt-6">
          <UserDescription
            user={user}
            isFollowing={isFollowing}
            toggleFollow={toggleFollow}
          />
        </div>
        <div className="w-full flex flex-col items-start">
          <UserContents user={user} toggleFollow={toggleFollow} />
        </div>
      </div>
    </div>
  )
}

export default UserPage
