import { DashboardPieChart } from './Charts/DasshboardPieChart'

export const DarshboardUserDemographics: React.FC = () => {
  const labels = ['North America', 'Europe', 'Asia', 'Others']
  const datasets = [
    {
      data: [300, 150, 100, 50],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    },
  ]

  return (
    <DashboardPieChart
      caption="デモグラフィックデータ"
      labels={labels}
      datasets={datasets}
    />
  )
}
