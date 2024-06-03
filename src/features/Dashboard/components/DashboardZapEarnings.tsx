import { DarshboardBarChart } from './Charts/DashboardBarChart'

export const DarshboardZapEarnings: React.FC = () => {
  const labels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
  ]
  const datasets = [
    {
      label: 'Zap Earnings',
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
      borderColor: 'rgba(255, 206, 86, 1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255, 206, 86, 0.4)',
      hoverBorderColor: 'rgba(255, 206, 86, 1)',
      data: [500, 1000, 1500, 2000, 2500, 3000, 3500],
    },
  ]

  return (
    <DarshboardBarChart caption="Zap収益" labels={labels} datasets={datasets} />
  )
}
