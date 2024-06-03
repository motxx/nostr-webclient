import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title)

interface DarshboardBarChartProps {
  caption: string
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    hoverBackgroundColor?: string
    hoverBorderColor?: string
  }[]
}

export const DarshboardBarChart: React.FC<DarshboardBarChartProps> = ({
  caption,
  labels,
  datasets,
}) => {
  const defaultDataset = {
    backgroundColor: 'rgba(54, 162, 235, 0.2)',
    borderColor: 'rgba(54, 162, 235, 1)',
    borderWidth: 1,
    hoverBackgroundColor: 'rgba(54, 162, 235, 0.4)',
    hoverBorderColor: 'rgba(54, 162, 235, 1)',
  }
  const data = {
    labels,
    datasets: datasets.map((dataset) => {
      return { ...defaultDataset, ...dataset }
    }),
  }

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
        {caption}
      </h3>
      <div className="flex-1">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}
