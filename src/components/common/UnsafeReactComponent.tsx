import React from 'react'
import parse, { DOMNode, domToReact, Element } from 'html-react-parser'
import DefaultLink from './DefaultLink'

interface UnsafeReactComponentProps {
  jsxString: string
}

const UnsafeReactComponent: React.FC<UnsafeReactComponentProps> = ({
  jsxString,
}) => {
  const options = {
    replace: (domNode: DOMNode) => {
      if (
        (domNode as Element).name?.toLowerCase() === 'defaultlink' &&
        (domNode as Element).attribs?.to
      ) {
        const { to, ...rest } = (domNode as Element).attribs
        return (
          <DefaultLink to={to}>
            {domToReact((domNode as Element).children as DOMNode[])}
          </DefaultLink>
        )
      }
    },
  }

  return <div>{parse(jsxString, options)}</div>
}

export default UnsafeReactComponent
