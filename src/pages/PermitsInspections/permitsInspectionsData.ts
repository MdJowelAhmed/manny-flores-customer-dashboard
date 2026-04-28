import { FileCheck2, Clock4, CalendarDays, CheckCircle2 } from 'lucide-react'

export type PermitStatus = 'Approved' | 'Pending'

export type PermitInvoiceStatus = 'Paid' | 'Pending' | 'Sent'

/** Demo / API: must match logged-in user so customers only see their own rows */
export const DEMO_CUSTOMER_FULL_NAME = 'Jhon Lura'
export const DEMO_CUSTOMER_EMAIL = 'customer@example.com'

export interface PermitRow {
  id: number
  permitId: string
  customer: string
  customerEmail: string
  /** Project this permit/inspection belongs to (display name) */
  project: string
  /** Stable project reference / code for linking */
  projectCode: string
  /** Invoice tied to this permit (fees, filing, or bundled billing) */
  relatedInvoiceNumber: string
  relatedInvoiceDate: string
  relatedInvoiceAmount: number
  relatedInvoiceStatus: PermitInvoiceStatus
  type: string
  category: 'permit' | 'inspection'
  status: PermitStatus
  applied: string
  expiry: string
}

export type PermitStatCard = {
  title: string
  value: number
  icon: typeof FileCheck2
  iconBg: string
  iconColor: string
}

/** Stats derived from the current customer’s visible rows only */
export function computePermitStats(rows: PermitRow[]): PermitStatCard[] {
  const activePermits = rows.filter(
    (r) => r.category === 'permit' && r.status === 'Approved'
  ).length
  const pendingPermits = rows.filter(
    (r) => r.category === 'permit' && r.status === 'Pending'
  ).length
  const inspectionRows = rows.filter((r) => r.category === 'inspection')
  const upcomingInspections = inspectionRows.length
  const passedInspections = inspectionRows.filter((r) => r.status === 'Approved').length

  return [
    {
      title: 'Active Permits',
      value: activePermits,
      icon: FileCheck2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Pending Permits',
      value: pendingPermits,
      icon: Clock4,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Upcoming Inspections',
      value: upcomingInspections,
      icon: CalendarDays,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Passed Inspections',
      value: passedInspections,
      icon: CheckCircle2,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ]
}

function normalizeName(s: string) {
  return s.trim().replace(/\s+/g, ' ').toLowerCase()
}

/** Only rows belonging to the signed-in customer (match email first, then full name) */
export function filterPermitsForCurrentUser(
  all: PermitRow[],
  user: { email: string; firstName: string; lastName: string } | null
): PermitRow[] {
  if (!user) return []
  const email = user.email.trim().toLowerCase()
  const fullName = normalizeName(`${user.firstName} ${user.lastName}`)
  return all.filter((r) => {
    if (r.customerEmail.trim().toLowerCase() === email) return true
    return normalizeName(r.customer) === fullName
  })
}

export const mockPermits: PermitRow[] = [
  {
    id: 1,
    permitId: 'PER-2026-001',
    customer: DEMO_CUSTOMER_FULL_NAME,
    customerEmail: DEMO_CUSTOMER_EMAIL,
    project: 'Garden Design & Installation',
    projectCode: 'PRJ-2026-014',
    relatedInvoiceNumber: 'INV-2026-1088',
    relatedInvoiceDate: '1/4/2026',
    relatedInvoiceAmount: 1240,
    relatedInvoiceStatus: 'Paid',
    type: 'Building Permit',
    category: 'permit',
    status: 'Approved',
    applied: '1/5/2026',
    expiry: '1/7/2026',
  },
  {
    id: 2,
    permitId: 'PER-2026-002',
    customer: DEMO_CUSTOMER_FULL_NAME,
    customerEmail: DEMO_CUSTOMER_EMAIL,
    project: 'Front Yard Landscaping',
    projectCode: 'PRJ-2026-021',
    relatedInvoiceNumber: 'INV-2026-1102',
    relatedInvoiceDate: '2/8/2026',
    relatedInvoiceAmount: 890,
    relatedInvoiceStatus: 'Sent',
    type: 'Irrigation Permit',
    category: 'permit',
    status: 'Approved',
    applied: '2/10/2026',
    expiry: '1/12/2026',
  },
  {
    id: 3,
    permitId: 'PER-2026-003',
    customer: DEMO_CUSTOMER_FULL_NAME,
    customerEmail: DEMO_CUSTOMER_EMAIL,
    project: 'Patio & Deck Construction',
    projectCode: 'PRJ-2026-033',
    relatedInvoiceNumber: 'INV-2026-1115',
    relatedInvoiceDate: '12/8/2026',
    relatedInvoiceAmount: 2100,
    relatedInvoiceStatus: 'Pending',
    type: 'Building Permit',
    category: 'permit',
    status: 'Pending',
    applied: '12/10/2026',
    expiry: '-',
  },
  {
    id: 4,
    permitId: 'INS-2026-004',
    customer: DEMO_CUSTOMER_FULL_NAME,
    customerEmail: DEMO_CUSTOMER_EMAIL,
    project: 'Backyard Renovation',
    projectCode: 'PRJ-2026-007',
    relatedInvoiceNumber: 'INV-2026-1071',
    relatedInvoiceDate: '2/9/2026',
    relatedInvoiceAmount: 450,
    relatedInvoiceStatus: 'Paid',
    type: 'Irrigation Permit',
    category: 'inspection',
    status: 'Approved',
    applied: '2/10/2026',
    expiry: '2/12/2026',
  },
  // Other customers (hidden when signed in as demo user — filter by email / name)
  {
    id: 5,
    permitId: 'PER-2026-099',
    customer: 'Alex Rivera',
    customerEmail: 'alex@example.com',
    project: 'Commercial Plaza HVAC',
    projectCode: 'PRJ-2026-900',
    relatedInvoiceNumber: 'INV-2026-2001',
    relatedInvoiceDate: '3/1/2026',
    relatedInvoiceAmount: 5600,
    relatedInvoiceStatus: 'Pending',
    type: 'Building Permit',
    category: 'permit',
    status: 'Approved',
    applied: '3/2/2026',
    expiry: '9/1/2026',
  },
]

