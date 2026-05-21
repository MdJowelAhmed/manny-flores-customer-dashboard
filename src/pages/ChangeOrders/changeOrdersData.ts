import { FileText, Info, DollarSign } from 'lucide-react'

export type ChangeOrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

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
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

