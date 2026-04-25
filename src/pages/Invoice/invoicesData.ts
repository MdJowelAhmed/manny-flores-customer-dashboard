import { addDays, format, parseISO } from 'date-fns'

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'draft'

export interface InvoiceLaborLine {
  quantity: number
  price: number
}

export interface InvoiceItemLine {
  name: string
  quantity: number
  unitPricePerSqFt: number
  totalPrice: number
}

export interface Invoice {
  id: string
  /** Display reference e.g. EST-501 */
  refCode: string
  customerName: string
  materialSummary: string
  summaryQty: number
  summaryCostCount: number
  /** Grand total in USD (whole dollars for display) */
  amount: number
  /** ISO date string */
  invoiceDate: string
  description?: string
  status?: InvoiceStatus
  /** ISO due date */
  dueDate?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  labor?: InvoiceLaborLine
  material?: InvoiceItemLine
  equipment?: InvoiceItemLine
  /** Billable subtotal before tax & discount; if omitted, sum of line prices when lines exist */
  subtotal?: number
  /** Tax percent e.g. 10 for 10% */
  taxPercent?: number
  discountAmount?: number
  /** Digital signature (data URL) captured on approval */
  signatureDataUrl?: string
  /** ISO timestamp when user approved/signed */
  approvedAt?: string
}

export function fmtInvoiceUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

export interface InvoiceBreakdown {
  labor: InvoiceLaborLine
  material: InvoiceItemLine
  equipment: InvoiceItemLine
  subtotal: number
  taxPercent: number
  taxAmount: number
  discountAmount: number
  grandTotal: number
}

/** Build a consistent breakdown for the detail modal (uses explicit lines when present, otherwise derives from totals). */
export function getInvoiceBreakdown(inv: Invoice): InvoiceBreakdown {
  const taxPercent = inv.taxPercent ?? 10
  const discountAmount = inv.discountAmount ?? 0
  const hasLines = inv.labor != null && inv.material != null && inv.equipment != null

  if (hasLines) {
    const labor = inv.labor!
    const material = inv.material!
    const equipment = inv.equipment!
    const lineSum = labor.price + material.totalPrice + equipment.totalPrice
    const subtotal = inv.subtotal ?? lineSum
    const taxable = Math.max(0, subtotal - discountAmount)
    const taxAmount = Math.round(taxable * (taxPercent / 100))
    return {
      labor,
      material,
      equipment,
      subtotal,
      taxPercent,
      taxAmount,
      discountAmount,
      grandTotal: inv.amount,
    }
  }

  const grandTotal = inv.amount
  const netBeforeTax = grandTotal / (1 + taxPercent / 100)
  const taxAmount = Math.round(grandTotal - netBeforeTax)
  const subtotal = Math.round(netBeforeTax + discountAmount)
  const toAllocate = Math.max(0, Math.round(netBeforeTax))

  const laborPrice = Math.max(1, Math.round(toAllocate * 0.38))
  const matTotal = Math.max(1, Math.round(toAllocate * 0.34))
  const eqTotal = Math.max(1, toAllocate - laborPrice - matTotal)

  const labor: InvoiceLaborLine = {
    quantity: inv.summaryQty,
    price: laborPrice,
  }
  const material: InvoiceItemLine = {
    name: inv.materialSummary,
    quantity: Math.max(1, inv.summaryQty * 4),
    unitPricePerSqFt: 42,
    totalPrice: matTotal,
  }
  const equipment: InvoiceItemLine = {
    name: inv.materialSummary,
    quantity: Math.max(1, inv.summaryQty * 3),
    unitPricePerSqFt: 48,
    totalPrice: eqTotal,
  }

  return {
    labor,
    material,
    equipment,
    subtotal,
    taxPercent,
    taxAmount,
    discountAmount,
    grandTotal,
  }
}

const invoicesRaw: Invoice[] = [
  {
    id: '1',
    refCode: 'EST-501',
    customerName: 'Karim Ullah',
    materialSummary: 'Rock/Stone',
    summaryQty: 4,
    summaryCostCount: 3,
    amount: 9350,
    invoiceDate: '2026-03-04',
    description: 'Rock and stone installation — phase 1',
    labor: { quantity: 10, price: 850 },
    material: {
      name: 'Synthetic Grass',
      quantity: 15,
      unitPricePerSqFt: 450,
      totalPrice: 1050,
    },
    equipment: {
      name: 'Synthetic Grass',
      quantity: 15,
      unitPricePerSqFt: 450,
      totalPrice: 1050,
    },
    subtotal: 8500,
    taxPercent: 10,
    discountAmount: 0,
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
    taxPercent: 10,
    discountAmount: 150,
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

const statusCycle: InvoiceStatus[] = ['pending', 'paid', 'overdue', 'draft']

function slugCustomerName(name: string, index: number) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '')
  return `${base}${index}@email.com`
}

export const invoicesData: Invoice[] = invoicesRaw.map((inv, i) => {
  let due: string
  try {
    due = format(addDays(parseISO(inv.invoiceDate), 14 + (i % 6)), 'yyyy-MM-dd')
  } catch {
    due = inv.invoiceDate
  }
  return {
    ...inv,
    status: inv.status ?? statusCycle[i % statusCycle.length],
    dueDate: inv.dueDate ?? due,
    customerEmail: inv.customerEmail ?? slugCustomerName(inv.customerName, i + 1),
    customerPhone:
      inv.customerPhone ?? `+1 (555) ${String(200 + i).padStart(3, '0')}-${String(1000 + i * 37).slice(-4)}`,
    customerAddress:
      inv.customerAddress ?? `${120 + i * 13} Oak Ridge Dr, Austin, TX ${78700 + (i % 10)}`,
  }
})
