import { DarshboardBarChart } from './Charts/DashboardBarChart'

export const DarshboardPaidContentSales: React.FC = () => {
  const labels = [
    'Content 1',
    'Content 2',
    'Content 3',
    'Content 4',
    'Content 5',
  ]
  const datasets = [
    {
      label: 'Paid Content Sales',
      data: [300, 500, 700, 400, 600],
    },
  ]

  return (
    <DarshboardBarChart
      caption="コンテンツ売上高"
      labels={labels}
      datasets={datasets}
    />
  )
}
