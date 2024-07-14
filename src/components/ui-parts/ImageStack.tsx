import React from 'react'

interface ImageStackProps {
  images: string[]
  size?: number
  borderColor?: string
}

const ImageStack: React.FC<ImageStackProps> = ({
  images,
  size = 8,
  borderColor = 'border-white dark:border-gray-800',
}) => (
  <div className="flex -space-x-2">
    {images.map((image, idx) => (
      <img
        key={idx}
        src={image}
        alt={`${idx + 1}`}
        className={`w-${size} h-${size} rounded-full border-2 ${borderColor}`}
        style={{ zIndex: images.length - idx }}
      />
    ))}
  </div>
)

export default ImageStack
