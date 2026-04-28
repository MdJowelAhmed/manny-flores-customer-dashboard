export type PaymentStatus = 'Paid' | 'Partial' | 'Pending'

export interface Payment {
  id: string
  invoice: string
  customer: string
  project: string
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  method: string
  status: PaymentStatus
  paymentDate?: string
  /** Merged note from add-payment flow (check filename, employee contact, user note) */
  note?: string
}

export const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Card', label: 'Card' },
] as const

export const paymentsData: Payment[] = [
  {
    id: '1',
    invoice: 'INV-2026-001',
    customer: 'Emily Davis',
    project: 'Garden Design & Installation',
    totalAmount: 12560,
    paidAmount: 12560,
    outstandingAmount: 0,
    method: 'Finance',
    status: 'Paid',
    paymentDate: '15/01/2026',
  },
  {
    id: '2',
    invoice: 'INV-2026-002',
    customer: 'Emily Davis',
    project: 'Front Yard Landscaping',
    totalAmount: 22099,
    paidAmount: 22099,
    outstandingAmount: 0,
    method: 'Cash',
    status: 'Paid',
    paymentDate: '18/01/2026',
  },
  {
    id: '3',
    invoice: 'INV-2026-003',
    customer: 'Emily Davis',
    project: 'Patio & Deck Construction',
    totalAmount: 22099,
    paidAmount: 9099,
    outstandingAmount: 13000,
    method: 'Finance',
    status: 'Partial',
    paymentDate: '22/01/2026',
  },
  {
    id: '4',
    invoice: 'INV-2026-004',
    customer: 'Emily Davis',
    project: 'Backyard Renovation',
    totalAmount: 14949,
    paidAmount: 9000,
    outstandingAmount: 5949,
    method: 'Cash',
    status: 'Pending',
  },
]
export interface PaymentSummary {
  totalPaid: number
  totalCollected: number
  outstanding: number
  paidInvoicesCount: number
}

export const paymentSummaryData: PaymentSummary = {
  totalPaid: 63000,
  totalCollected: 40650,
  outstanding: 22350,
  paidInvoicesCount: 4,
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

