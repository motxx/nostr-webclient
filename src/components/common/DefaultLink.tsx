import { Link } from 'react-router-dom'

interface DefaultLinkProps {
  to: string
  children: React.ReactNode
}

const DefaultLink: React.FC<DefaultLinkProps> = ({ to, children, ...rest }) => {
  return (
    <Link to={to} {...rest} className="hover:underline text-blue-500">
      {children}
    </Link>
  )
}

export default DefaultLink
