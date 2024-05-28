import React, { useEffect, useRef, useState } from 'react'
import { Network } from 'vis-network/standalone/esm/vis-network'

export const ExploreUserInfluenceGraph: React.FC = () => {
  const networkContainer = useRef<HTMLDivElement>(null)

  const [networkData, setNetworkData] = useState<{
    nodes: any[]
    edges: any[]
  }>({
    nodes: [
      { id: 1, label: 'User 1' },
      { id: 2, label: 'User 2' },
      { id: 3, label: 'User 3' },
      { id: 4, label: 'User 4' },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 4 },
    ],
  })

  useEffect(() => {
    if (networkContainer.current) {
      const options = {
        nodes: {
          shape: 'dot',
          size: 16,
        },
        edges: {
          width: 2,
        },
        physics: {
          stabilization: false,
        },
      }
      new Network(networkContainer.current, networkData, options)
    }
  }, [networkData])

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
        ユーザー影響力マップ
      </h3>
      <div className="flex-1">
        <div ref={networkContainer} className="w-full aspect-square" />
      </div>
    </div>
  )
}
