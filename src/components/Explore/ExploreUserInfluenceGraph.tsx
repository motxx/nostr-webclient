import React, { useEffect, useRef, useState } from 'react'
import {
  Edge,
  Network,
  Node,
  Options,
} from 'vis-network/standalone/esm/vis-network'

type Metric = 'engagement' | 'reposts' | 'likes' | 'zaps'
type NodeData = Node & { [key in Metric]: number }

const ExploreUserInfluenceGraph: React.FC = () => {
  const networkContainer = useRef<HTMLDivElement>(null)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [metric, setMetric] = useState<Metric>('engagement')
  const [hashtag, setHashtag] = useState<string>('')

  const [networkData, setNetworkData] = useState<{
    nodes: NodeData[]
    edges: Edge[]
  }>({
    nodes: [
      {
        shape: 'circularImage',
        id: 1,
        label: 'User 1',
        engagement: 10,
        reposts: 5,
        likes: 20,
        zaps: 2,
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
      {
        shape: 'circularImage',
        id: 2,
        label: 'User 2',
        engagement: 20,
        reposts: 10,
        likes: 30,
        zaps: 5,
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
      },
      {
        shape: 'circularImage',
        id: 3,
        label: 'User 3',
        engagement: 30,
        reposts: 15,
        likes: 40,
        zaps: 10,
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
      },
      {
        shape: 'circularImage',
        id: 4,
        label: 'User 4',
        engagement: 40,
        reposts: 20,
        likes: 50,
        zaps: 20,
        image: 'https://randomuser.me/api/portraits/women/2.jpg',
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
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    if (networkContainer.current) {
      const options: Options = {
        nodes: {
          shape: 'image',
          size: 50,
          borderWidth: 2,
          borderWidthSelected: 4,
          font: {
            size: 12,
            face: 'Tahoma',
            color: isDarkMode ? '#D1D5DB' : '#1F2937', // light: gray-800, dark: gray-300
          },
          color: {
            border: isDarkMode ? '#6B7280' : '#D1D5DB', // light: gray-300, dark: gray-600
            background: isDarkMode ? '#1F2937' : '#F3F4F6', // light: gray-100, dark: gray-800
            highlight: {
              border: isDarkMode ? '#FFFFFF' : '#000000', // white or black
              background: isDarkMode ? '#374151' : '#E5E7EB', // light: gray-200, dark: gray-700
            },
            hover: {
              border: isDarkMode ? '#9CA3AF' : '#6B7280', // light: gray-600, dark: gray-400
              background: isDarkMode ? '#1F2937' : '#D1D5DB', // light: gray-300, dark: gray-600
            },
          },
          shapeProperties: {
            borderRadius: 50,
          },
        },
        edges: {
          color: {
            color: isDarkMode ? '#6B7280' : '#D1D5DB', // light: gray-300, dark: gray-600
            highlight: isDarkMode ? '#FFFFFF' : '#000000', // white or black
            hover: isDarkMode ? '#9CA3AF' : '#6B7280', // light: gray-600, dark: gray-400
          },
          arrows: {
            to: { enabled: true, scaleFactor: 1 },
          },
          width: 1,
          smooth: false,
        },
        physics: {
          stabilization: false,
        },
        layout: {
          improvedLayout: true,
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
  }, [networkData, metric, isDarkMode])

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
          className="mr-4 p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:bg-gray-800 dark:text-gray-300"
        >
          <option value="engagement">エンゲージメント</option>
          <option value="reposts">Renote数</option>
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
          className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:bg-gray-800 dark:text-gray-300"
        />
      </div>
      <div className="flex-1">
        <div ref={networkContainer} className="w-full aspect-square" />
      </div>
    </div>
  )
}

export default ExploreUserInfluenceGraph
