import { FaGithub, FaGlobe, FaInstagram } from 'react-icons/fa'
import { User } from '@/models/user'
import { SiBluesky, SiX } from 'react-icons/si'

interface UserExternalLinksProps {
  links: User['links']
}

const renderLinkIcon = (
  url: string,
  IconComponent: React.ComponentType,
  alt: string
) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="text-2xl text-gray-700 dark:text-gray-300 hover:text-blue-500 transition"
  >
    <IconComponent aria-label={alt} />
  </a>
)

const UserExternalLinks: React.FC<UserExternalLinksProps> = ({ links }) => {
  return links && Object.keys(links).length > 0 ? (
    <>
      <div className="flex space-x-4">
        {links.github && renderLinkIcon(links.github, FaGithub, 'GitHub')}
        {links.twitter && renderLinkIcon(links.twitter, SiX, 'X')}
        {links.bluesky && renderLinkIcon(links.bluesky, SiBluesky, 'BlueSky')}
        {links.instagram &&
          renderLinkIcon(links.instagram, FaInstagram, 'Instagram')}
        {links.website && renderLinkIcon(links.website, FaGlobe, 'Website')}
      </div>
    </>
  ) : (
    <></>
  )
}

export default UserExternalLinks
