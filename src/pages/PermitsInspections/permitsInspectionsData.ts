import { FileCheck2, Clock4, CalendarDays, CheckCircle2 } from 'lucide-react'

export type PermitStatus = 'Approved' | 'Pending'

export interface PermitRow {
  id: number
  permitId: string
  customer: string
  project: string
  type: string
  category: 'permit' | 'inspection'
  status: PermitStatus
  applied: string
  expiry: string
}

export const permitStats = [
  {
    title: 'Active Permits',
    value: 2,
    icon: FileCheck2,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Pending Permits',
    value: 1,
    icon: Clock4,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Upcoming Inspections',
    value: 4,
    icon: CalendarDays,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    title: 'Passed Inspections',
    value: 1,
    icon: CheckCircle2,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
]

export const mockPermits: PermitRow[] = [
  {
    id: 1,
    permitId: 'INV-2026-001',
    customer: 'Michael Chen',
    project: 'Garden Design & Installation',
    type: 'Building Permit',
    category: 'permit',
    status: 'Approved',
    applied: '1/5/2026',
    expiry: '1/7/2026',
  },
  {
    id: 2,
    permitId: 'INV-2026-002',
    customer: 'David Martinez',
    project: 'Front Yard Landscaping',
    type: 'Irrigation Permit',
    category: 'permit',
    status: 'Approved',
    applied: '2/10/2026',
    expiry: '1/12/2026',
  },
  {
    id: 3,
    permitId: 'INV-2026-003',
    customer: 'Lisa Anderson',
    project: 'Patio & Deck Construction',
    type: 'Building Permit',
    category: 'permit',
    status: 'Pending',
    applied: '12/10/2026',
    expiry: '-',
  },
  {
    id: 4,
    permitId: 'INV-2026-004',
    customer: 'Emily Davis',
    project: 'Backyard Renovation',
    type: 'Irrigation Permit',
    category: 'inspection',
    status: 'Approved',
    applied: '2/10/2026',
    expiry: '2/12/2026',
  },
]

