import React, { useState } from 'react'
import DOMPurify from 'dompurify'
import UnsafeReactComponent from './UnsafeReactComponent'

const newlineToBr = (text: string): string => text.split('\n').join('<br />')

const hashtagToLink = (text: string): string =>
  text.replace(
    /#([^\s#@<>${}/\\]+)/g,
    (match, p1) => `<RouterLink to='/hashtag/${p1}'>#${p1}</RouterLink>`
  )

const nostrNpubToLink = (text: string): string =>
  // TODO: Convert npub to nostr address
  text.replace(
    /nostr:(npub1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58})/g,
    (match, p1) => `<RouterLink to='/user/${p1}'>${p1}</RouterLink>`
  )

const expandExternalLink = (text: string): string =>
  text.replace(
    /(https?:\/\/(?:www\.)?(?!(?:x\.com|twitter\.com)\/\S+)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/g,
    (match, p1) => `<ExternalLink href='${p1}'>${p1}</ExternalLink>`
  )

const expandOEmbedOfStatusX = (text: string): string =>
  text.replace(
    /(https:\/\/(x|twitter)\.com\/(\w+)\/status\/(\d+))/g,
    (match, p1, p2, p3, p4) => `<TwitterTweetEmbed tweetId="${p4}" />`
  )

const expandExternalLinkForProfileX = (text: string): string =>
  text.replace(
    /(https:\/\/(x|twitter)\.com\/\w+\/?)/g,
    (match, p1, p2, p3) => `<ExternalLink href="${p1}">${p1}</ExternalLink>`
  )

const expandOEmbedOfTimelineX = (text: string): string => {
  return text.replace(
    /(https:\/\/(x|twitter)\.com\/(\w+)\/?)/g,
    (match, p1, p2, p3) =>
      `<TwitterTimelineEmbed sourceType="profile" screenName="${p3}" />`
  )
}

const applyTransformations = (
  text: string,
  transformations: ((text: string) => string)[]
): string => {
  let transformedText = text
  for (const transformation of transformations) {
    transformedText = transformation(transformedText)
  }
  return transformedText
}

interface TextConverterProps {
  text: string
}

export const TextConverter: React.FC<TextConverterProps> = ({ text }) => {
  const sanitizedHTML = DOMPurify.sanitize(text)
  const transformations = [
    newlineToBr,
    hashtagToLink,
    nostrNpubToLink,
    expandExternalLink,
    expandOEmbedOfStatusX,
    expandExternalLinkForProfileX,
  ]
  const finalText = applyTransformations(sanitizedHTML, transformations)
  return <UnsafeReactComponent jsxString={finalText} />
}
