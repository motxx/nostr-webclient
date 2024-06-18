import React from 'react'
import { convertToEmbedUrl } from '@/utils/contentConverter'
import { Media } from '@/domain/entities/Note'

interface NoteItemMediaProps {
  media: Media[]
  text: string
  openDetails: () => void
  youtubeIFrameRef?: React.RefObject<HTMLIFrameElement>
}

const NoteItemMedia: React.FC<NoteItemMediaProps> = ({
  media,
  text,
  openDetails,
  youtubeIFrameRef,
}) => {
  const isMobile = () => window.matchMedia('(max-width: 640px)').matches

  const handleOnClick = () => {
    if (!isMobile()) {
      openDetails()
    }
  }

  return (
    <div>
      {media.map((item, index) => {
        const embedUrl =
          item.type === 'youtube' ? convertToEmbedUrl(item.url) : undefined

        switch (item.type) {
          case 'image':
            return (
              <img
                key={index}
                src={item.url}
                alt={text}
                className={`w-full ${isMobile() ? 'h-full' : 'max-h-[500px]'} object-cover sm:rounded sm:border border-gray-200 dark:border-gray-700 cursor-pointer`}
                onClick={handleOnClick}
              />
            )
          case 'video':
            return (
              <video
                key={index}
                src={item.url}
                controls
                autoPlay
                muted
                playsInline
                className={`w-full ${isMobile() ? 'h-full' : 'max-h-[500px]'} object-cover sm:rounded sm:border border-gray-200 dark:border-gray-700 cursor-pointer`}
              />
            )
          case 'youtube':
            return (
              <iframe
                key={index}
                ref={youtubeIFrameRef}
                className="w-full aspect-video sm:rounded sm:border border-gray-200 dark:border-gray-700 cursor-pointer"
                title={text}
                src={`${embedUrl}?enablejsapi=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
            )
          default:
            return null
        }
      })}
    </div>
  )
}

export default NoteItemMedia
