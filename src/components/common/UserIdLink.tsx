import { Link } from 'react-router-dom'

const UserIdLink = ({ userId }: { userId: string }) => {
  return (
    <Link to={`/user/${userId}`}>
      <span className="font-bold hover:underline">{userId}</span>
    </Link>
  )
}

export default UserIdLink
