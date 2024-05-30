import React, { useEffect, useRef, useState } from 'react'
import { Edge, Network, Node } from 'vis-network/standalone/esm/vis-network'

type Metric = 'engagement' | 'reposts' | 'likes' | 'zaps'
type NodeData = Node & { [key in Metric]: number }

export const ExploreUserInfluenceGraph: React.FC = () => {
  const networkContainer = useRef<HTMLDivElement>(null)

  const [metric, setMetric] = useState<Metric>('engagement')
  const [hashtag, setHashtag] = useState<string>('')

  const [networkData, setNetworkData] = useState<{
    nodes: NodeData[]
    edges: Edge[]
  }>({
    nodes: [
      {
        id: 1,
        label: 'User 1',
        engagement: 10,
        reposts: 5,
        likes: 20,
        zaps: 2,
      },
      {
        id: 2,
        label: 'User 2',
        engagement: 20,
        reposts: 10,
        likes: 30,
        zaps: 5,
      },
      {
        id: 3,
        label: 'User 3',
        engagement: 30,
        reposts: 15,
        likes: 40,
        zaps: 10,
      },
      {
        id: 4,
        label: 'User 4',
        engagement: 40,
        reposts: 20,
        likes: 50,
        zaps: 20,
      },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 1 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 4 },
      { from: 4, to: 3 },
    ],
  })

  const handleMetricChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMetric(event.target.value as Metric)
  }

  const handleHashtagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHashtag(event.target.value)
  }

  useEffect(() => {
    if (networkContainer.current) {
      const options = {
        nodes: {
          shape: 'dot',
          scaling: {
            min: 10,
            max: 50,
          },
          font: {
            size: 12,
            face: 'Tahoma',
          },
        },
        edges: {
          arrows: {
            to: { enabled: true, scaleFactor: 1 },
          },
          width: 2,
        },
        physics: {
          stabilization: false,
        },
      }

      const updatedNodes = networkData.nodes.map((node) => ({
        ...node,
        value: node[metric],
      }))

      const updatedEdges = networkData.edges.reduce((acc, edge) => {
        const existingEdge = acc.find(
          (e: Edge) => e.from === edge.to && e.to === edge.from
        )
        if (existingEdge) {
          existingEdge.arrows = 'to, from'
        } else {
          acc.push(edge)
        }
        return acc
      }, [] as Edge[])

      new Network(
        networkContainer.current,
        { nodes: updatedNodes, edges: updatedEdges },
        options
      )
    }
  }, [networkData, metric])

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
        ユーザー影響力マップ
      </h3>
      <div className="flex items-center mb-4">
        <label
          className="mr-2 text-gray-700 dark:text-gray-300"
          htmlFor="metric"
        >
          指標選択:
        </label>
        <select
          id="metric"
          value={metric}
          onChange={handleMetricChange}
          className="mr-4 p-2 border border-gray-300 rounded bg-transparent"
        >
          <option value="engagement">エンゲージメント</option>
          <option value="reposts">Repost数</option>
          <option value="likes">Like数</option>
          <option value="zaps">Zap数</option>
        </select>
        <label
          className="mr-2 text-gray-700 dark:text-gray-300"
          htmlFor="hashtag"
        >
          ハッシュタグ:
        </label>
        <input
          id="hashtag"
          type="text"
          value={hashtag}
          onChange={handleHashtagChange}
          className="p-2 border border-gray-300 rounded bg-transparent"
        />
      </div>
      <div className="flex-1">
        <div ref={networkContainer} className="w-full aspect-square" />
      </div>
    </div>
  )
}
