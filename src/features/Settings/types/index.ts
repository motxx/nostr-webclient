import { IconType } from 'react-icons'

export type SettingNavigationItem = {
  id: string
  label: string
  icon: IconType
}

export type BudgetPeriodId = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type SettingBudgetPeriod = {
  id: BudgetPeriodId
  label: string
}
