export type PaymentRecordStatus = 'completed' | 'pending' | 'rejected'
export type PaymentLegacyStatus = 'Paid' | 'Partial' | 'Pending'
export type PaymentStatus = PaymentRecordStatus | PaymentLegacyStatus

export interface Payment {
  id: string
  estimateId?: string
  invoice: string
  customer: string
  project: string
  /** Payment transaction amount from API */
  amount?: number | null
  /** Estimate total from API */
  totalCost?: number
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  method: string
  status: PaymentStatus
  paymentDate?: string
  note?: string | null
  checkImage?: string | null
  trxId?: string | null
}

export const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Card', label: 'Card' },
] as const

export interface PaymentSummary {
  totalPaid: number
  totalCollected: number
  outstanding: number
  paidInvoicesCount: number
}

export const years = ['2026', '2025', '2024', '2023']

export const generatePaymentChartData = (year: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const baseValue = 600 + (parseInt(year, 10) - 2021) * 100
  return months.map((month, index) => {
    const seasonMultiplier = index >= 10 || index <= 1 ? 1.2 : index >= 5 && index <= 7 ? 0.9 : 1
    const randomVariation = () => 0.85 + Math.random() * 0.3
    return {
      month,
      value: Math.round(baseValue * seasonMultiplier * randomVariation() * (1 + index * 0.05)),
    }
  })
}

export const paymentChartYearlyData: Record<string, ReturnType<typeof generatePaymentChartData>> = {
  '2026': generatePaymentChartData('2026'),
  '2025': generatePaymentChartData('2025'),
  '2024': generatePaymentChartData('2024'),
  '2023': generatePaymentChartData('2023'),
}

export function formatPaymentStatusLabel(status: PaymentStatus): string {
  const normalized = String(status).toLowerCase()
  if (normalized === 'completed' || normalized === 'paid') return 'Completed'
  if (normalized === 'pending') return 'Pending'
  if (normalized === 'rejected') return 'Rejected'
  if (normalized === 'partial') return 'Partial'
  return status
}
