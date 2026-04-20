export interface Invoice {
  id: string
  /** Display reference e.g. EST-501 */
  refCode: string
  customerName: string
  materialSummary: string
  summaryQty: number
  summaryCostCount: number
  /** Amount in USD (whole dollars for display) */
  amount: number
  /** ISO date string */
  invoiceDate: string
  description?: string
}

export function fmtInvoiceUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

export const invoicesData: Invoice[] = [
  {
    id: '1',
    refCode: 'EST-501',
    customerName: 'Karim Ullah',
    materialSummary: 'Rock/Stone',
    summaryQty: 4,
    summaryCostCount: 3,
    amount: 8560,
    invoiceDate: '2026-03-04',
    description: 'Rock and stone installation — phase 1',
  },
  {
    id: '2',
    refCode: 'EST-502',
    customerName: 'Sarah Johnson',
    materialSummary: 'Garden mix',
    summaryQty: 2,
    summaryCostCount: 4,
    amount: 12560,
    invoiceDate: '2026-03-04',
    description: 'Garden design materials and labor',
  },
  {
    id: '3',
    refCode: 'EST-503',
    customerName: 'Michael Chen',
    materialSummary: 'Sod & soil',
    summaryQty: 8,
    summaryCostCount: 5,
    amount: 18960,
    invoiceDate: '2026-03-10',
  },
  {
    id: '4',
    refCode: 'EST-504',
    customerName: 'Lisa Anderson',
    materialSummary: 'Shrubs',
    summaryQty: 12,
    summaryCostCount: 2,
    amount: 17160,
    invoiceDate: '2026-03-15',
  },
  {
    id: '5',
    refCode: 'EST-505',
    customerName: 'Emily Davis',
    materialSummary: 'Timber',
    summaryQty: 6,
    summaryCostCount: 4,
    amount: 16500,
    invoiceDate: '2026-03-18',
  },
  {
    id: '6',
    refCode: 'EST-506',
    customerName: 'Robert Brown',
    materialSummary: 'Stone pavers',
    summaryQty: 20,
    summaryCostCount: 6,
    amount: 14990,
    invoiceDate: '2026-03-20',
  },
  {
    id: '7',
    refCode: 'EST-507',
    customerName: 'Maria Garcia',
    materialSummary: 'Mulch',
    summaryQty: 3,
    summaryCostCount: 3,
    amount: 19250,
    invoiceDate: '2026-03-22',
  },
  {
    id: '8',
    refCode: 'EST-508',
    customerName: 'John Williams',
    materialSummary: 'PVC & heads',
    summaryQty: 14,
    summaryCostCount: 2,
    amount: 8750,
    invoiceDate: '2026-03-25',
  },
  {
    id: '9',
    refCode: 'EST-509',
    customerName: 'James Lee',
    materialSummary: 'Asphalt',
    summaryQty: 1,
    summaryCostCount: 2,
    amount: 22400,
    invoiceDate: '2026-04-01',
  },
  {
    id: '10',
    refCode: 'EST-510',
    customerName: 'Mike Johnson',
    materialSummary: 'Cedar panels',
    summaryQty: 9,
    summaryCostCount: 4,
    amount: 11200,
    invoiceDate: '2026-04-02',
  },
  {
    id: '11',
    refCode: 'EST-511',
    customerName: 'Anna Taylor',
    materialSummary: 'Irrigation kit',
    summaryQty: 5,
    summaryCostCount: 3,
    amount: 6400,
    invoiceDate: '2026-04-05',
  },
  {
    id: '12',
    refCode: 'EST-512',
    customerName: 'David Kim',
    materialSummary: 'Lighting',
    summaryQty: 7,
    summaryCostCount: 2,
    amount: 3200,
    invoiceDate: '2026-04-08',
  },
]
