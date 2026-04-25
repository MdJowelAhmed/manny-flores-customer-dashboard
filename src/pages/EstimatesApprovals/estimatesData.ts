import { format, isValid, parse } from 'date-fns'

export type EstimateStatus =
  | 'Approved'
  | 'Pending'
  | 'Draft'
  | 'Follow Up'
  | 'Rejected'
  | 'Invoiced'
  | 'Project Created'

/** Pill styles for list cards (matches Estimates & Quoting design). */
export const ESTIMATE_LIST_BADGE: Record<
  EstimateStatus,
  { label: string; className: string }
> = {
  Pending: {
    label: 'SENT',
    className: 'bg-purple-100 text-purple-800',
  },
  Approved: {
    label: 'APPROVED',
    className: 'bg-[#22c55e] text-white',
  },
  Invoiced: {
    label: 'INVOICED',
    className: 'bg-blue-100 text-blue-800',
  },
  'Project Created': {
    label: 'PROJECT',
    className: 'bg-emerald-100 text-emerald-800',
  },
  Draft: {
    label: 'DRAFT',
    className: 'bg-gray-200 text-gray-800',
  },
  'Follow Up': {
    label: 'FOLLOW UP',
    className: 'bg-amber-100 text-amber-900',
  },
  Rejected: {
    label: 'REJECTED',
    className: 'bg-red-100 text-red-800',
  },
}

/** @deprecated Use ESTIMATE_LIST_BADGE for new UI */
export const ESTIMATE_STATUS_BADGE: Record<
  EstimateStatus,
  { bg: string; text: string }
> = {
  Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Follow Up': { bg: 'bg-amber-50', text: 'text-amber-700' },
  Draft: { bg: 'bg-white border border-gray-300', text: 'text-gray-700' },
  Pending: { bg: 'bg-purple-100', text: 'text-purple-800' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-700' },
  Invoiced: { bg: 'bg-blue-50', text: 'text-blue-700' },
  'Project Created': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
}

export interface EstimateLineItem {
  description: string
  unitCost: number
  qty: number
  taxable: boolean
}

export interface EstimateDetailBreakdown {
  labor: { quantity: number; price: number }
  material: {
    name: string
    quantity: number
    unitPriceLabel: string
    unitPrice: number
    totalPrice: number
  }
  equipment: {
    name: string
    quantity: number
    unitPriceLabel: string
    unitPrice: number
    totalPrice: number
  }
  price: { totalPrice: number; taxPercent?: number }
}

export interface Estimate {
  id: string
  estimateCode: string
  project: string
  amount: string
  status: EstimateStatus
  startDate: string
  customerName: string
  email: string
  company: string
  startDateFormatted?: string
  amountDue?: string
  contactNumber?: string
  businessProjectDetail?: string
  lineItems?: EstimateLineItem[]
  taxRatePercent?: number
  /** List card: e.g. Rock/Stone */
  materialSummary?: string
  summaryQty?: number
  /** Shown as "Cost: N" metadata */
  summaryCostCount?: number
  /** Modal sections; if absent, derived from line items */
  detailBreakdown?: EstimateDetailBreakdown
}

export function formatEstimateCardDate(startDate: string): string {
  const fmts = ['d/M/yyyy', 'M/d/yyyy', 'dd/MM/yyyy', 'd/M/yy']
  for (const f of fmts) {
    const d = parse(startDate, f, new Date())
    if (isValid(d)) return format(d, 'dd/MM/yy')
  }
  return startDate
}

export function parseAmountToNumber(amount: string): number {
  const raw = amount.replace(/,/g, '').replace(/[^0-9.]/g, '')
  return Number.parseFloat(raw) || 0
}

export function fmtUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

export function getLineItemsForEstimate(est: Estimate): EstimateLineItem[] {
  if (est.lineItems?.length) return est.lineItems
  const n = parseAmountToNumber(est.amount)
  return [{ description: est.project, unitCost: n, qty: 1, taxable: true }]
}

export function computeEstimateTotals(
  items: EstimateLineItem[],
  taxRatePercent: number
) {
  let subtotal = 0
  let tax = 0
  for (const row of items) {
    const lineTotal = row.unitCost * row.qty
    subtotal += lineTotal
    if (row.taxable) tax += lineTotal * (taxRatePercent / 100)
  }
  return { subtotal, tax, total: subtotal + tax }
}

export function getDetailBreakdownForEstimate(
  est: Estimate
): EstimateDetailBreakdown {
  if (est.detailBreakdown) return est.detailBreakdown

  const items = getLineItemsForEstimate(est)
  const taxPct = est.taxRatePercent ?? 10
  const { total } = computeEstimateTotals(items, taxPct)
  const first = items[0]
  const second = items[1] ?? first
  const laborQty = items.reduce((a, b) => a + b.qty, 0)
  const laborPrice = first ? first.unitCost * Math.min(first.qty, 10) : 0

  return {
    labor: {
      quantity: laborQty || 10,
      price: laborPrice || 850,
    },
    material: {
      name: first?.description ?? 'Synthetic Grass',
      quantity: first?.qty ?? 15,
      unitPriceLabel: 'Unit Price/sq.ft',
      unitPrice: first?.unitCost ?? 450,
      totalPrice: first ? first.unitCost * first.qty : 1050,
    },
    equipment: {
      name: second?.description ?? 'Synthetic Grass',
      quantity: second?.qty ?? 15,
      unitPriceLabel: 'Unit Price/sq.ft',
      unitPrice: second?.unitCost ?? 450,
      totalPrice: second ? second.unitCost * second.qty : 1050,
    },
    price: {
      totalPrice: total || 450,
      taxPercent: taxPct,
    },
  }
}

export const estimatesData: Estimate[] = [
  {
    id: '1',
    estimateCode: 'EST-501',
    project: 'Rock/Stone installation',
    amount: '$8,500',
    status: 'Pending',
    startDate: '4/3/2026',
    customerName: 'Karim Ullah',
    email: 'karim@email.com',
    company: 'Outdoor Works',
    materialSummary: 'Rock/Stone',
    summaryQty: 4,
    summaryCostCount: 3,
    taxRatePercent: 10,
    detailBreakdown: {
      labor: { quantity: 10, price: 850 },
      material: {
        name: 'Synthetic Grass',
        quantity: 15,
        unitPriceLabel: 'Unit Price/sq.ft',
        unitPrice: 450,
        totalPrice: 1050,
      },
      equipment: {
        name: 'Synthetic Grass',
        quantity: 15,
        unitPriceLabel: 'Unit Price/sq.ft',
        unitPrice: 450,
        totalPrice: 1050,
      },
      price: { totalPrice: 8500, taxPercent: 10 },
    },
    lineItems: [
      { description: 'Rock/Stone', unitCost: 2125, qty: 4, taxable: true },
    ],
  },
  {
    id: '2',
    estimateCode: 'EST-502',
    project: 'Garden Design & Installation',
    amount: '$12,560',
    status: 'Approved',
    startDate: '10/1/2026',
    customerName: 'Sarah Johnson',
    email: 'sarah@gmail.com',
    company: 'Lawn Care Package',
    materialSummary: 'Garden mix',
    summaryQty: 2,
    summaryCostCount: 4,
    taxRatePercent: 15,
    lineItems: [
      {
        description: 'Garden Design & Installation',
        unitCost: 500,
        qty: 1,
        taxable: true,
      },
      {
        description: 'Backyard Renovation',
        unitCost: 150,
        qty: 10,
        taxable: false,
      },
    ],
  },
  {
    id: '3',
    estimateCode: 'EST-503',
    project: 'Backyard Renovation',
    amount: '$18,960',
    status: 'Pending',
    startDate: '3/10/2026',
    customerName: 'Michael Chen',
    email: 'michael@email.com',
    company: 'Green Space Solutions',
    materialSummary: 'Sod & soil',
    summaryQty: 8,
    summaryCostCount: 5,
  },
  {
    id: '4',
    estimateCode: 'EST-504',
    project: 'Front Yard Landscaping',
    amount: '$17,160',
    status: 'Approved',
    startDate: '5/10/2026',
    customerName: 'Lisa Anderson',
    email: 'lisa@email.com',
    company: 'Lawn Care Package',
    materialSummary: 'Shrubs',
    summaryQty: 12,
    summaryCostCount: 2,
  },
  {
    id: '5',
    estimateCode: 'EST-505',
    project: 'Patio & Deck Construction',
    amount: '$16,500',
    status: 'Draft',
    startDate: '15/10/2026',
    customerName: 'Emily Davis',
    email: 'emily@email.com',
    company: 'Outdoor Living Co',
    materialSummary: 'Timber',
    summaryQty: 6,
    summaryCostCount: 4,
  },
  {
    id: '6',
    estimateCode: 'EST-506',
    project: 'Pool Landscaping',
    amount: '$14,990',
    status: 'Pending',
    startDate: '19/10/2026',
    customerName: 'Robert Brown',
    email: 'robert@email.com',
    company: 'Aqua Landscapes',
    materialSummary: 'Stone pavers',
    summaryQty: 20,
    summaryCostCount: 6,
  },
  {
    id: '7',
    estimateCode: 'EST-507',
    project: 'Commercial Landscaping',
    amount: '$19,250',
    status: 'Approved',
    startDate: '21/10/2026',
    customerName: 'Maria Garcia',
    email: 'maria@email.com',
    company: 'Green Space Solutions',
    materialSummary: 'Mulch',
    summaryQty: 3,
    summaryCostCount: 3,
  },
  {
    id: '8',
    estimateCode: 'EST-508',
    project: 'Irrigation System',
    amount: '$8,750',
    status: 'Follow Up',
    startDate: '29/10/2026',
    customerName: 'John Williams',
    email: 'john@email.com',
    company: 'Lawn Care Package',
    materialSummary: 'PVC & heads',
    summaryQty: 14,
    summaryCostCount: 2,
  },
  {
    id: '9',
    estimateCode: 'EST-509',
    project: 'Driveway Paving',
    amount: '$22,400',
    status: 'Draft',
    startDate: '2/11/2026',
    customerName: 'Sarah Johnson',
    email: 'sarah@email.com',
    company: 'Lawn Care Package',
    materialSummary: 'Asphalt',
    summaryQty: 1,
    summaryCostCount: 2,
  },
  {
    id: '10',
    estimateCode: 'EST-510',
    project: 'Fence Installation',
    amount: '$11,200',
    status: 'Pending',
    startDate: '5/11/2026',
    customerName: 'Mike Johnson',
    email: 'mike@email.com',
    company: 'Lawn Care Package',
    materialSummary: 'Cedar panels',
    summaryQty: 9,
    summaryCostCount: 4,
  },
]
