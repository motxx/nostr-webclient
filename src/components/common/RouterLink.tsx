import { Link } from 'react-router-dom'

interface RouterLinkProps {
  to: string
  children: React.ReactNode
}

const RouterLink: React.FC<RouterLinkProps> = ({ to, children, ...rest }) => {
  return (
    <Link
      to={to}
      {...rest}
      className="hover:underline text-blue-500 dark:text-blue-400"
    >
      {children}
    </Link>
  )
}

export default RouterLink
