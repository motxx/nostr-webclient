import React, { useRef, useEffect, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { BsCaretLeftFill, BsCaretRightFill } from 'react-icons/bs'

interface ImageCarouselProps {
  items: { image: string; link: string }[]
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ items }) => {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const handleWheel = (event: WheelEvent) => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += event.deltaY
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      if (carouselRef.current) {
        carouselRef.current.scrollLeft += eventData.deltaX
        updateButtonVisibility()
      }
    },
    onSwipedRight: (eventData) => {
      if (carouselRef.current) {
        carouselRef.current.scrollLeft -= eventData.deltaX
        updateButtonVisibility()
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

  useEffect(() => {
    updateButtonVisibility()
  }, [items])

  const updateButtonVisibility = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth)
    }
  }

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
        } else {
          updateButtonVisibility()
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
        onScroll={updateButtonVisibility}
      >
        {items.map((item, index) => (
          <a
            key={index}
            href={item.link}
            className="carousel-item inline-block w-60 h-40 m-2 transform transition-transform duration-300 ease-in-out hover:scale-105"
          >
            <img
              src={item.image}
              alt={`Carousel item ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
          </a>
        ))}
      </div>
      {canScrollLeft && (
        <button
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={scrollLeft}
        >
          <BsCaretLeftFill size={24} />
        </button>
      )}
      {canScrollRight && (
        <button
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={scrollRight}
        >
          <BsCaretRightFill size={24} />
        </button>
      )}
    </div>
  )
}

export default ImageCarousel
