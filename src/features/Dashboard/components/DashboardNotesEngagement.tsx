import { DarshboardBarChart } from './Charts/DashboardBarChart'

export const DashboardNotesEngagement: React.FC = () => {
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
      label: 'Notes Engagement',
      backgroundColor: 'rgba(75,192,192,0.2)',
      borderColor: 'rgba(75,192,192,1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(75,192,192,0.4)',
      hoverBorderColor: 'rgba(75,192,192,1)',
      data: [65, 59, 80, 81, 56, 55, 40],
    },
  ]

  return (
    <DarshboardBarChart
      caption="ノートのエンゲージメント"
      labels={labels}
      datasets={datasets}
    />
  )
}
