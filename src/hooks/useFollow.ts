import { useAtom } from 'jotai'
import { followStatusFamily } from '@/state/follow'
import toast from 'react-hot-toast'

export const useFollow = (pubkey: string) => {
  const [isFollowing, setIsFollowing] = useAtom(followStatusFamily(pubkey))

  const toggleFollow = (userName: string) => {
    const newFollowing = !isFollowing
    setIsFollowing(newFollowing)
    toast(
      `${userName}さん${newFollowing ? 'をフォローしました' : 'のフォローを解除しました'}`,
      {
        position: 'bottom-center',
        duration: 2000,
        style: {
          borderRadius: '40px',
          background: '#1d4ed8',
          color: '#fff',
        },
      }
    )
    return true
  }

  return { isFollowing, toggleFollow }
}
