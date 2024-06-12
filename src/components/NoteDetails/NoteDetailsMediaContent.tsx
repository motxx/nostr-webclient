import React from 'react'
import { convertToEmbedUrl } from '@/utils/contentConverter'
import { MediaType, NoteType } from '@/domain/entities/Note'

interface NoteDetailsMediaContentProps {
  note: NoteType
  mediaType?: MediaType
  onBackgroundClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

const NoteDetailsMediaContent: React.FC<NoteDetailsMediaContentProps> = ({
  note,
  mediaType: _mediaType,
  onBackgroundClick,
}) => {
  const mediaType = _mediaType
    ? _mediaType
    : note.mediaTypes?.size
      ? note.mediaTypes?.has('youtube')
        ? 'youtube'
        : note.mediaTypes?.has('video')
          ? 'video'
          : note.mediaTypes?.has('audio')
            ? 'audio'
            : 'image'
      : undefined

  const embedUrl =
    mediaType === 'youtube' && note.youtubeUrl
      ? convertToEmbedUrl(note.youtubeUrl)
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
            src={note.imageUrl}
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
            <video src={note.videoUrl} controls autoPlay muted playsInline />
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
