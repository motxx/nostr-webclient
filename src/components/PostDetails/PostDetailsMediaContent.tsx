import React from 'react'
import { convertToEmbedUrl } from '../../utils/contentConverter'

interface PostDetailsMediaContentProps {
  mediaUrl: string
  mediaType: 'image' | 'video-file' | 'video-youtube'
  onBackgroundClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

const PostDetailsMediaContent: React.FC<PostDetailsMediaContentProps> = ({
  mediaUrl,
  mediaType,
  onBackgroundClick,
}) => {
  const embedUrl =
    mediaType === 'video-youtube' ? convertToEmbedUrl(mediaUrl) : mediaUrl

  const handleMediaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  switch (mediaType) {
    case 'image':
      return (
        <div
          className="w-full h-full flex items-center justify-center"
          onClick={onBackgroundClick}
        >
          <img
            src={mediaUrl}
            alt="Overlay"
            className="max-w-full max-h-full object-contain"
            onClick={handleMediaClick}
          />
        </div>
      )
    case 'video-file':
      return (
        <div
          className="w-full h-full flex items-center justify-center"
          onClick={onBackgroundClick}
        >
          <div
            onClick={handleMediaClick}
            className="max-w-full max-h-full object-contain"
          >
            <video src={mediaUrl} controls autoPlay muted playsInline />
          </div>
        </div>
      )
    case 'video-youtube':
      return (
        <div
          className="w-full h-full flex items-center justify-center"
          onClick={onBackgroundClick}
        >
          <iframe
            className="w-full h-auto aspect-video"
            src={`${embedUrl}?autoplay=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="YouTube video"
            onClick={handleMediaClick}
          ></iframe>
        </div>
      )
    default:
      return null
  }
}

export default PostDetailsMediaContent
