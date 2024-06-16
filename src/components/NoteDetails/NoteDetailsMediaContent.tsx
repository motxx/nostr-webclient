import React from 'react'
import { convertToEmbedUrl } from '@/utils/contentConverter'
import { NoteType } from '@/domain/entities/Note'

interface NoteDetailsMediaContentProps {
  note: NoteType
  onBackgroundClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

const NoteDetailsMediaContent: React.FC<NoteDetailsMediaContentProps> = ({
  note,
  onBackgroundClick,
}) => {
  const media =
    note.media?.find((m) => m.type === 'youtube') ||
    note.media?.find((m) => m.type === 'video') ||
    note.media?.find((m) => m.type === 'image')

  const mediaType = media?.type

  const embedUrl =
    mediaType === 'youtube' && media?.url
      ? convertToEmbedUrl(media.url)
      : undefined

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
            src={media?.url}
            alt="Overlay"
            className="max-w-full max-h-full object-contain"
            onClick={handleMediaClick}
          />
        </div>
      )
    case 'video':
      return (
        <div
          className="w-full h-full flex items-center justify-center"
          onClick={onBackgroundClick}
        >
          <div
            onClick={handleMediaClick}
            className="max-w-full max-h-full object-contain"
          >
            <video src={media?.url} controls autoPlay muted playsInline />
          </div>
        </div>
      )
    case 'youtube':
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

export default NoteDetailsMediaContent
