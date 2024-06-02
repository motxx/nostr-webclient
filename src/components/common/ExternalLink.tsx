import { FaExternalLinkAlt } from 'react-icons/fa'

interface ExternalLinkProps {
  href: string
  children: React.ReactNode
}

const ExternalLink: React.FC<ExternalLinkProps> = ({
  href,
  children,
  ...rest
}) => {
  return (
    <a
      href={href}
      {...rest}
      className="hover:underline text-blue-500 dark:text-blue-400"
      target="_blank"
      rel="noreferrer"
    >
      {children}
      <FaExternalLinkAlt className="inline-block ml-1 mb-1 mr-1" />
    </a>
  )
}

export default ExternalLink
