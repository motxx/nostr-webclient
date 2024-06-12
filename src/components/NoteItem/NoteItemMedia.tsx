import React from 'react'
import { convertToEmbedUrl } from '@/utils/contentConverter'
import { MediaType } from '@/domain/entities/Note'

interface NoteItemMediaProps {
  mediaTypes: Set<MediaType>
  imageUrl?: string
  videoUrl?: string
  youtubeUrl?: string
  text: string
  openDetails: () => void
  youtubeIFrameRef?: React.RefObject<HTMLIFrameElement>
}

const NoteItemMedia: React.FC<NoteItemMediaProps> = ({
  mediaTypes,
  imageUrl,
  videoUrl,
  youtubeUrl,
  text,
  openDetails,
  youtubeIFrameRef,
}) => {
  const isMobile = () => window.matchMedia('(max-width: 640px)').matches
  const embedUrl =
    mediaTypes.has('youtube') && youtubeUrl
      ? convertToEmbedUrl(youtubeUrl)
      : undefined

  const handleOnClick = () => {
    if (!isMobile()) {
      openDetails()
    }
  }

  return (
    <div>
      {mediaTypes.has('image') && (
        <img
          src={imageUrl}
          alt="Post media"
          className={`w-full ${isMobile() ? 'h-full' : 'max-h-[500px]'} object-cover sm:rounded sm:border border-gray-200 dark:border-gray-700 cursor-pointer`}
          onClick={handleOnClick}
        />
      )}
      {mediaTypes.has('video') && (
        <video
          src={videoUrl}
          controls
          autoPlay
          muted
          playsInline
          className={`w-full ${isMobile() ? 'h-full' : 'max-h-[500px]'} object-cover sm:rounded sm:border border-gray-200 dark:border-gray-700 cursor-pointer`}
        />
      )}
      {mediaTypes.has('youtube') && (
        <iframe
          ref={youtubeIFrameRef}
          className="w-full aspect-video sm:rounded sm:border border-gray-200 dark:border-gray-700 cursor-pointer"
          title={text}
          src={`${embedUrl}?enablejsapi=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      )}
    </div>
  )
}

export default NoteItemMedia
