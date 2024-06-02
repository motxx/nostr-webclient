import React from 'react'
import parse, { DOMNode, domToReact, Element } from 'html-react-parser'
import RouterLink from './RouterLink'
import ExternalLink from './ExternalLink'

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
        const { to, ...rest } = (domNode as Element).attribs
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
        const { href, ...rest } = (domNode as Element).attribs
        return (
          <ExternalLink href={href}>
            {domToReact((domNode as Element).children as DOMNode[])}
          </ExternalLink>
        )
      }
    },
  }

  return <div>{parse(jsxString, options)}</div>
}

export default UnsafeReactComponent