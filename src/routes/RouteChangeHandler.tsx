import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

interface RouteChangeHandlerProps {
  onRouteChange: (pathname: string) => void
}

const RouteChangeHandler: React.FC<RouteChangeHandlerProps> = ({
  onRouteChange,
}) => {
  const location = useLocation()
  const [prevPathname, setPrevPathname] = useState(location.pathname)

  useEffect(() => {
    if (location.pathname !== prevPathname) {
      onRouteChange(location.pathname)
      setPrevPathname(location.pathname)
    }
  }, [location.pathname, onRouteChange, prevPathname])

  return null
}

export default RouteChangeHandler
