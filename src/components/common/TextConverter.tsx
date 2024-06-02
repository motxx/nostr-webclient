import React, { useState, useEffect } from 'react'
import DOMPurify from 'dompurify'
import UnsafeReactComponent from './UnsafeReactComponent'
import axios from 'axios'

const newlineToBr = (text: string): string => text.split('\n').join('<br />')

const hashtagToLink = (text: string): string =>
  text.replace(
    /#([^\s#@<>${}/\\]+)/g,
    (match, p1) => `<RouterLink to='/hashtag/${p1}'>#${p1}</RouterLink>`
  )

const expandExternalLink = (text: string): string =>
  text.replace(
    /(https?:\/\/(?:www\.)?(?!(?:x\.com|twitter\.com)\/\S+)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/g,
    (match, p1) => `<ExternalLink href='${p1}'>${p1}</ExternalLink>`
  )

const expandOEmbedOfX = async (text: string): Promise<string> => {
  const fetchOEmbed = async (url: string) => {
    try {
      const response = await axios.get(
        `https://noscape-backend.motxx.workers.dev/api/oembed?url=${url}`
      )
      return response.data.html
    } catch (error) {
      console.error('Failed to fetch oEmbed data:', error)
      return ''
    }
  }

  const urlMatch = text.match(/(https?:\/\/)?(www\.)?(x|twitter)\.com\/\S+/)
  if (urlMatch) {
    const oEmbedHTML = await fetchOEmbed(encodeURIComponent(urlMatch[0]))
    console.log(oEmbedHTML)
    return text.replace(urlMatch[0], oEmbedHTML)
  }
  return text
}

const applyTransformations = async (
  text: string,
  transformations: ((text: string) => string | Promise<string>)[]
): Promise<string> => {
  let transformedText = text
  for (const transformation of transformations) {
    transformedText = await transformation(transformedText)
  }
  return transformedText
}

interface TextConverterProps {
  text: string
}

export const TextConverter: React.FC<TextConverterProps> = ({ text }) => {
  const [transformedText, setTransformedText] = useState<string>('')

  useEffect(() => {
    const transformText = async () => {
      const sanitizedHTML = DOMPurify.sanitize(text)
      const transformations = [
        newlineToBr,
        hashtagToLink,
        expandOEmbedOfX,
        expandExternalLink,
      ]
      const finalText = await applyTransformations(
        sanitizedHTML,
        transformations
      )
      setTransformedText(finalText)
    }

    transformText()
  }, [text])

  return <UnsafeReactComponent jsxString={transformedText} />
}
