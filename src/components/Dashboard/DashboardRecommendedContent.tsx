import React from 'react'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

export const DashboardRecommendedContent: React.FC = () => {
  const contentData = [
    {
      title: 'Content 1',
      description: 'Description of the content goes here.',
    },
    {
      title: 'Content 2',
      description: 'Description of the content goes here.',
    },
    {
      title: 'Content 3',
      description: 'Description of the content goes here.',
    },
    {
      title: 'Content 4',
      description: 'Description of the content goes here.',
    },
    {
      title: 'Content 5',
      description: 'Description of the content goes here.',
    },
    {
      title: 'Content 6',
      description: 'Description of the content goes here.',
    },
  ]

  const handleSwipeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
  }

  const handleSwipeMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    return false
  }

  const handleSwipeEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="recommended-content-container"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
        Recommended Content
      </h3>
      <Carousel
        showArrows
        swipeable
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        autoPlay={false}
        emulateTouch
        centerMode
        centerSlidePercentage={40}
        onSwipeStart={handleSwipeStart}
        onSwipeMove={handleSwipeMove}
        onSwipeEnd={handleSwipeEnd}
      >
        {contentData.map((content, index) => (
          <div className="carousel-slide" key={index}>
            <div className="content-item bg-gray-100 dark:bg-gray-700 p-4 rounded">
              <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">
                {content.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {content.description}
              </p>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  )
}
