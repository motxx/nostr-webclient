import { DashboardPieChart } from './Charts/DasshboardPieChart'

export const DashboardTotalEarnings: React.FC = () => {
  const labels = ['Zap Earnings', 'Paid Content Sales']
  const datasets = [{ data: [18000, 2500] }]

  return (
    <DashboardPieChart caption="総収益" labels={labels} datasets={datasets} />
  )
}
