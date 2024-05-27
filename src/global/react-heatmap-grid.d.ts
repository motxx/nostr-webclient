declare module 'react-heatmap-grid' {
  import * as React from 'react'

  interface HeatMapProps {
    xLabels: string[]
    yLabels: string[]
    data: number[][]
    height?: number
    squares?: boolean
    cellStyle?: (
      background: string,
      value: number,
      min: number,
      max: number,
      data: number[][],
      x: number,
      y: number
    ) => React.CSSProperties
    cellRender?: (value: number) => React.ReactNode
  }

  const HeatMap: React.FC<HeatMapProps>

  export default HeatMap
}
