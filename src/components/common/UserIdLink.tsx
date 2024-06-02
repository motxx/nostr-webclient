import { Link } from 'react-router-dom'

const UserIdLink = ({ userId }: { userId: string }) => {
  return (
    <Link to={`/user/${userId}`} className="font-bold hover:underline">
      {userId}
    </Link>
  )
}

export default UserIdLink
