import React, { useRef, useEffect, useState } from 'react'
import Slider, { Settings } from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { BsCaretLeftFill, BsCaretRightFill } from 'react-icons/bs'

interface ImageCarouselArrowProps {
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

interface ImageCarouselProps {
  images: string[]
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const sliderRef = useRef<Slider | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hovered, setHovered] = useState(false)
  const [scrollDistance, setScrollDistance] = useState(0)

  const PrevArrow: React.FC<ImageCarouselArrowProps> = ({ onClick }) => {
    return (
      <BsCaretLeftFill
        onClick={onClick}
        className={`block absolute top-1/2 transform -translate-y-1/2 left-0 sm:-left-6 text-3xl rounded-full p-2 cursor-pointer z-20 ${hovered ? 'text-white bg-gray-800 dark:text-white dark:bg-gray-100 opacity-90 dark:opacity-90 bg-opacity-10 dark:bg-opacity-10' : 'text-gray-100 dark:text-gray-800 opacity-95'}`}
      />
    )
  }

  const NextArrow: React.FC<ImageCarouselArrowProps> = ({ onClick }) => {
    return (
      <BsCaretRightFill
        onClick={onClick}
        className={`block absolute top-1/2 transform -translate-y-1/2 right-0 sm:-right-6 text-3xl rounded-full p-2 cursor-pointer z-20 ${hovered ? 'text-white bg-gray-800 dark:text-white dark:bg-gray-100 opacity-90 dark:opacity-90 bg-opacity-10 dark:bg-opacity-10' : 'text-gray-100 dark:text-gray-800 opacity-95'}`}
      />
    )
  }

  const settings: Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    swipe: true,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  }

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const slideWidth = containerRef.current?.clientWidth || 0
      setScrollDistance((prevDistance) => prevDistance + event.deltaX)

      if (sliderRef.current) {
        const innerSlider = sliderRef.current.innerSlider as any
        const slidesToScroll = Math.round(scrollDistance / slideWidth)
        if (slidesToScroll !== 0) {
          innerSlider.slickGoTo(innerSlider.state.currentSlide + slidesToScroll)
          setScrollDistance(0) // Reset the scroll distance after scrolling
        }
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [scrollDistance])

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full w-full hide-scroll"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Slider ref={sliderRef} {...settings}>
        {images.map((image, index) => (
          <div key={index} className="px-2">
            <div className="w-full h-full">
              <img
                src={image}
                alt={`Slide ${index}`}
                className="w-[200px] h-[200px] object-cover rounded-lg"
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default ImageCarousel
