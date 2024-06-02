import React from 'react'
import { Link } from 'react-router-dom'

const convertHashtags = (text: string) => {
  const hashtagPattern = /#([^ \n]+)/g
  return text.split(hashtagPattern).map((part, index) => {
    if (index % 2 === 1) {
      return (
        <Link to={`/hashtag/${part}`} className="text-blue-500 hover:underline">
          #{part}
        </Link>
      )
    }
    return part
  })
}

const convertNewlines = (text: string) => {
  return text.split('\n').map((part, index) => (
    <React.Fragment key={index}>
      {part}
      {index < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ))
}

export const convertTextForDisplay = (text: string) => {
  const hashtagElements = convertHashtags(text)
  return hashtagElements.map((part, index) => {
    if (typeof part === 'string') {
      return (
        <React.Fragment key={index}>{convertNewlines(part)}</React.Fragment>
      )
    }
    return part
  })
}

export const convertToEmbedUrl = (url: string) => {
  const regex =
    //eslint-disable-next-line
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(regex)
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`
  }
  return url
}
