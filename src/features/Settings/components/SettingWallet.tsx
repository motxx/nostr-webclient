import React, { useState } from 'react'
import Input from '@/components/ui-elements/Input'
import BulletOption from '@/components/ui-elements/BulletOption'
import TertiaryButton from '@/components/ui-parts/TertiaryButton'
import { SettingBudgetPeriod } from '../types'
import QRCode from 'qrcode.react'

export const budgetPeriods: SettingBudgetPeriod[] = [
  { id: 'daily', label: '日次' },
  { id: 'weekly', label: '週次' },
  { id: 'monthly', label: '月次' },
  { id: 'yearly', label: '年次' },
]

const SettingWallet: React.FC = () => {
  const [connectionUri, setConnectionUri] = useState('')
  const [defaultZapAmount, setDefaultZapAmount] = useState(0)
  const [authBudget, setAuthBudget] = useState(0)
  const [budgetPeriodId, setBudgetPeriodId] = useState('daily')
  const [qrCodeValue, setQrCodeValue] = useState('')

  const handleGenerateQRCode = () => {
    const qrValue = `nostr+walletauth://example`
    setQrCodeValue(qrValue)
  }

  return (
    <div className="p-4 space-y-8">
      <div className="space-y-4">
        <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Nostr Wallet Connectの設定
        </label>
        <div className="space-y-2">
          <div>
            <label
              htmlFor="connection-uri"
              className="block text-sm text-gray-700 dark:text-gray-200 mb-2"
            >
              Connection URI
            </label>
            <Input
              id="connection-uri"
              type="text"
              value={connectionUri}
              onChange={(e) => setConnectionUri(e.target.value)}
              placeholder="nostr+walletconnect:<pubkey>?relay=<relay>&secret=<secret>"
              className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="zap-amount"
              className="block text-sm text-gray-700 dark:text-gray-200 mb-2"
            >
              デフォルトのZap数量 (sats)
            </label>
            <Input
              id="zap-amount"
              type="number"
              value={defaultZapAmount.toString()}
              onChange={(e) => setDefaultZapAmount(Number(e.target.value))}
              className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-gray-700 dark:text-gray-200 mb-2">
          Nostr Wallet Auth
        </label>
        <div className="space-y-2">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
              初期化期間
            </label>
            <div className="flex mt-2">
              {budgetPeriods.map((period) => (
                <BulletOption
                  key={period.id}
                  id={period.id}
                  label={period.label}
                  selected={budgetPeriodId === period.id}
                  onSelect={setBudgetPeriodId}
                />
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="budget"
              className="block text-sm text-gray-700 dark:text-gray-200 mb-2"
            >
              予算設定 (sats)
            </label>
            <Input
              id="budget"
              type="number"
              value={authBudget.toString()}
              onChange={(e) => setAuthBudget(Number(e.target.value))}
              className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <TertiaryButton
          onClick={handleGenerateQRCode}
          className="w-[200px] rounded-md"
        >
          NWAのQRコード出力
        </TertiaryButton>
        {qrCodeValue && (
          <div className="p-2 border w-[220px] h-[220px] border-gray-200 dark:border-gray-700 bg-white">
            <QRCode value={qrCodeValue} size={200} />
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingWallet
