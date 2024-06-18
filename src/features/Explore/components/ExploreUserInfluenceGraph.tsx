import React, { useEffect, useRef, useState } from 'react'
import {
  Edge,
  Network,
  Node,
  Options,
} from 'vis-network/standalone/esm/vis-network'
import { ExploreMetric } from '../types'

type NodeData = Node & { [key in ExploreMetric]: number }

interface ExploreUserInfluenceGraphProps {
  hashtags: string[]
  metric: ExploreMetric
}

const ExploreUserInfluenceGraph: React.FC<ExploreUserInfluenceGraphProps> = ({
  hashtags,
  metric,
}) => {
  const networkContainer = useRef<HTMLDivElement>(null)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  const [networkData] = useState<{
    nodes: NodeData[]
    edges: Edge[]
  }>({
    nodes: [
      {
        shape: 'circularImage',
        id: 1,
        label: 'User 1',
        engagement: 1000,
        reposts: 5,
        likes: 20,
        zaps: 2,
        followers: 100,
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
      {
        shape: 'circularImage',
        id: 2,
        label: 'User 2',
        engagement: 20,
        reposts: 1000,
        likes: 30,
        zaps: 5,
        followers: 200,
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
      },
      {
        shape: 'circularImage',
        id: 3,
        label: 'User 3',
        engagement: 30,
        reposts: 15,
        likes: 1000,
        zaps: 10,
        followers: 300,
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
      },
      {
        shape: 'circularImage',
        id: 4,
        label: 'User 4',
        engagement: 40,
        reposts: 20,
        likes: 50,
        zaps: 1000,
        followers: 400,
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
    <div className="flex items-center justify-center w-full h-full">
      <div
        ref={networkContainer}
        className="w-full h-full max-w-screen-md aspect-square"
      />
    </div>
  )
}

export default ExploreUserInfluenceGraph
