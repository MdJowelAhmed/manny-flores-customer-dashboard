import { FileText, Info, DollarSign } from 'lucide-react'

export type ChangeOrderStatus = 'Pending' | 'Approved' | 'Rejected'

export interface ChangeOrder {
  id: string
  orderId: string
  customerName: string
  projectName: string
  company: string
  originalCost: number
  additionalCost: number
  newTotal: number
  requestDate: string
  status: ChangeOrderStatus
  approvedDate?: string
  projectStartDate: string
  amountSpent: number
  totalBudget: number
  duration: string
  remaining: number
  email: string
  reasonForChange: string
  description: string
}

export const changeOrderStats = [
  {
    title: 'Total Change Orders',
    value: 0,
    icon: FileText,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    title: 'Pending Approval',
    value: 0,
    icon: Info,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Approved',
    value: 0,
    icon: FileText,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Value Impact',
    value: 0,
    icon: DollarSign,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
]

export const statusFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
]

export const statusUpdateOptions: { value: ChangeOrderStatus; label: string }[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
]

export const mockChangeOrders: ChangeOrder[] = [
  {
    id: 'co-1',
    orderId: 'CO-2026-012',
    customerName: 'Mike Johnson',
    projectName: 'Residential Backyard Renovation',
    company: 'Lawn Care Package',
    originalCost: 45000,
    additionalCost: 8500,
    newTotal: 53500,
    requestDate: 'Feb 10, 2026',
    status: 'Pending',
    approvedDate: undefined,
    projectStartDate: 'January 15, 2026',
    amountSpent: 28500,
    totalBudget: 45000,
    duration: '8 weeks',
    remaining: 16500,
    email: 'john@email.com',
    reasonForChange: 'Design modification',
    description:
      'Remove fountain feature, add additional garden beds.',
  },
  {
    id: 'co-2',
    orderId: 'CO-2026-011',
    customerName: 'John Smith',
    projectName: 'Residential Backyard Renovation',
    company: 'Lawn Care Package',
    originalCost: 45000,
    additionalCost: 8500,
    newTotal: 53500,
    requestDate: 'Feb 10, 2026',
    status: 'Approved',
    approvedDate: 'Feb 11, 2026',
    projectStartDate: 'January 15, 2026',
    amountSpent: 28500,
    totalBudget: 45000,
    duration: '8 weeks',
    remaining: 16500,
    email: 'john@email.com',
    reasonForChange: 'Design modification',
    description:
      'Remove fountain feature, add additional garden beds.',
  },
]
