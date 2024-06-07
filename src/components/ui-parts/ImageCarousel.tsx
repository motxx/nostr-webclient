import React, { useRef, useEffect } from 'react'
import { useSwipeable } from 'react-swipeable'
import { BsCaretLeftFill, BsCaretRightFill } from 'react-icons/bs'

interface ImageCarouselProps {
  items: { image: string; link: string }[]
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ items }) => {
  const carouselRef = useRef<HTMLDivElement>(null)

  const handleWheel = (event: WheelEvent) => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += event.deltaY
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      if (carouselRef.current) {
        carouselRef.current.scrollLeft += eventData.deltaX
      }
    },
    onSwipedRight: (eventData) => {
      if (carouselRef.current) {
        carouselRef.current.scrollLeft -= eventData.deltaX
      }
    },
  })

  useEffect(() => {
    const carouselElement = carouselRef.current
    if (carouselElement) {
      carouselElement.addEventListener('wheel', handleWheel)
    }
    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('wheel', handleWheel)
      }
    }
  }, [])

  const smoothScroll = (distance: number) => {
    if (carouselRef.current) {
      const start = carouselRef.current.scrollLeft
      const startTime = performance.now()

      const scroll = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / 300, 1) // 300ms for the scroll
        const amount = start + distance * progress
        carouselRef.current!.scrollLeft = amount

        if (progress < 1) {
          requestAnimationFrame(scroll)
        }
      }

      requestAnimationFrame(scroll)
    }
  }

  const scrollLeft = () => {
    smoothScroll(-300)
  }

  const scrollRight = () => {
    smoothScroll(300)
  }

  return (
    <div className="relative group">
      <div
        {...handlers}
        ref={carouselRef}
        className="carousel-container overflow-x-scroll whitespace-nowrap hide-scrollbar"
      >
        {items.map((item, index) => (
          <a
            key={index}
            href={item.link}
            className="carousel-item inline-block w-60 h-40 m-2"
          >
            <img
              src={item.image}
              alt={`Carousel item ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
          </a>
        ))}
      </div>
      <button
        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={scrollLeft}
      >
        <BsCaretLeftFill size={24} />
      </button>
      <button
        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={scrollRight}
      >
        <BsCaretRightFill size={24} />
      </button>
    </div>
  )
}

export default ImageCarousel
