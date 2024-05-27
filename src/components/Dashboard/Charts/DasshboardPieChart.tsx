import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface DashboardPieChartProps {
  caption: string
  labels: string[]
  datasets: {
    data: number[]
    backgroundColor?: string[]
    hoverBackgroundColor?: string[]
  }[]
}

export const DashboardPieChart: React.FC<DashboardPieChartProps> = ({
  caption,
  labels,
  datasets,
}) => {
  const defaultDataset = {
    backgroundColor: ['#FFCE56', '#36A2EB'],
    hoverBackgroundColor: ['#FFCE56', '#36A2EB'],
  }
  const data = {
    labels,
    datasets: datasets.map((dataset) => {
      return { ...defaultDataset, ...dataset }
    }),
  }
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
        {caption}
      </h3>
      <Pie data={data} />
    </div>
  )
}
