import { Link } from 'react-router-dom'

const UserIdLink = ({
  userId,
  userName,
}: {
  userId: string
  userName: string
}) => {
  return (
    <Link to={`/user/${userId}`} className="font-bold hover:underline">
      {userName}
    </Link>
  )
}

export default UserIdLink
