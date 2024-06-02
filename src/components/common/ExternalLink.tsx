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
      className="hover:underline text-blue-500"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  )
}

export default ExternalLink
