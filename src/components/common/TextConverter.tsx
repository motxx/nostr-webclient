import React from 'react'
import DOMPurify from 'dompurify'
import UnsafeReactComponent from './UnsafeReactComponent'

const newlineToBr = (text: string): string => text.split('\n').join('<br />')

const hashtagToLink = (text: string): string =>
  text.replace(
    /#([^ #@<>${}/\\\n]+)/g,
    (match, p1) => `<RouterLink to='/hashtag/${p1}'>#${p1}</RouterLink>`
  )

const atagToHyperLink = (text: string): string =>
  text.replace(
    /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/g,
    (match, p1) => `<ExternalLink href='${p1}'>${p1}</ExternalLink>`
  )

const applyTransformations = (
  text: string,
  transformations: ((text: string) => string)[]
): string => {
  return transformations.reduce(
    (transformedText, transformation) => transformation(transformedText),
    text
  )
}

interface TextConverterProps {
  text: string
}

export const TextConverter: React.FC<TextConverterProps> = ({ text }) => {
  const sanitizedHTML = DOMPurify.sanitize(text)
  const transformations = [newlineToBr, hashtagToLink, atagToHyperLink]
  const transformedText = applyTransformations(sanitizedHTML, transformations)
  return <UnsafeReactComponent jsxString={transformedText} />
}
