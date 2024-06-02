import React from 'react'
import DOMPurify from 'dompurify'
import UnsafeReactComponent from './UnsafeReactComponent'

const newlineToBr = (text: string): string => text.split('\n').join('<br />')

const hashtagToLink = (text: string): string =>
  text.replace(
    /#([^ #@<>${}/\\\n]+)/g,
    (match, p1) => `<DefaultLink to='/hashtag/${p1}'>#${p1}</DefaultLink>`
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
  const transformations = [newlineToBr, hashtagToLink]
  const transformedText = applyTransformations(sanitizedHTML, transformations)
  return <UnsafeReactComponent jsxString={transformedText} />
}
