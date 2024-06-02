import React, { useRef, useEffect, useState } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

interface ImageCarouselProps {
  images: string[]
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const sliderRef = useRef<Slider | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollDistance, setScrollDistance] = useState(0)

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
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
          slidesToShow: 1,
        },
      },
    ],
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
    <div ref={containerRef} className="mx-auto w-full hide-scroll">
      <Slider ref={sliderRef} {...settings}>
        {images.map((image, index) => (
          <div key={index} className="px-2">
            <div className="w-full h-full bg-gray-200">
              <img
                src={image}
                alt={`Slide ${index}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default ImageCarousel
