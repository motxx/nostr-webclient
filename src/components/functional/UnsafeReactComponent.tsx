import React from 'react'
import parse, { DOMNode, domToReact, Element } from 'html-react-parser'
import RouterLink from '@/components/ui-elements/RouterLink'
import ExternalLink from '@/components/ui-elements/ExternalLink'
import { TwitterTweetEmbed } from 'react-twitter-embed'

interface UnsafeReactComponentProps {
  jsxString: string
}

const UnsafeReactComponent: React.FC<UnsafeReactComponentProps> = ({
  jsxString,
}) => {
  const options = {
    replace: (domNode: DOMNode) => {
      if (
        (domNode as Element).name?.toLowerCase() === 'routerlink' &&
        (domNode as Element).attribs?.to
      ) {
        const { to } = (domNode as Element).attribs
        return (
          <RouterLink to={to}>
            {domToReact((domNode as Element).children as DOMNode[])}
          </RouterLink>
        )
      }
      if (
        (domNode as Element).name?.toLowerCase() === 'externallink' &&
        (domNode as Element).attribs?.href
      ) {
        const { href } = (domNode as Element).attribs
        return (
          <ExternalLink href={href}>
            {domToReact((domNode as Element).children as DOMNode[])}
          </ExternalLink>
        )
      }
      if (
        (domNode as Element).name?.toLowerCase() === 'twittertweetembed' &&
        (domNode as Element).attribs?.tweetid
      ) {
        const { tweetid } = (domNode as Element).attribs
        return (
          <TwitterTweetEmbed tweetId={tweetid} options={{ height: '400' }} />
        )
      }
    },
  }

  return <div className="break-all">{parse(jsxString, options)}</div>
}

export default UnsafeReactComponent
