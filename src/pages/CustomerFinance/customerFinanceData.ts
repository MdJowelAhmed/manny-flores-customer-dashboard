import { DollarSign, CreditCard, Wallet, TrendingUp } from 'lucide-react'
import type { Project, ProjectStatus } from '@/types'

export const financeStats = [
  {
    title: 'Total Revenue',
    value: 542300,
    icon: DollarSign,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    title: 'Cash Payments',
    value: 186500,
    icon: CreditCard,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    title: 'Financed Amount',
    value: 355800,
    icon: Wallet,
    iconBg: 'bg-purple-200',
    iconColor: 'text-purple-700',
  },
  {
    title: 'Pending Payments',
    value: 42100,
    icon: TrendingUp,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
]

export const projectStatusFilterOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Pending', label: 'Pending' },
]

export const paymentMethodOptions = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Financing', label: 'Financing' },
  { value: 'Card', label: 'Card' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
]

const customerOptions = [
  { value: 'Mike Johnson', label: 'Mike Johnson' },
  { value: 'ABC Corporation', label: 'ABC Corporation' },
  { value: 'John Smith', label: 'John Smith' },
]

export const mockFinanceProjects: Project[] = [
  {
    id: 'cf-1',
    projectName: 'Lawn Care Package',
    category: 'Lawn Care',
    customer: 'Mike Johnson',
    email: 'mike@email.com',
    company: 'GreenScape Pro-Main',
    startDate: 'January 15, 2026',
    totalBudget: 75000,
    amountSpent: 75000,
    duration: '8 weeks',
    remaining: 0,
    paymentMethod: 'Cash',
    status: 'Completed',
    amountDue: 0,
    description:
      'Complete lawn care package including mowing, edging, fertilization, and seasonal cleanup.',
  },
  {
    id: 'cf-2',
    projectName: 'Office Park Landscaping',
    category: 'Commercial',
    customer: 'ABC Corporation',
    email: 'contact@abc.com',
    company: 'ABC Corporation',
    startDate: 'February 1, 2026',
    totalBudget: 55000,
    amountSpent: 25000,
    duration: '12 weeks',
    remaining: 30000,
    paymentMethod: 'Cash',
    status: 'Active',
    amountDue: 30000,
    description: 'Commercial landscaping for office park entrance and common areas.',
  },
  {
    id: 'cf-3',
    projectName: 'Garden Design & Installation',
    category: 'Residential',
    customer: 'John Smith',
    email: 'john@email.com',
    company: 'Residential Backyard Renovation',
    startDate: 'January 20, 2026',
    totalBudget: 45000,
    amountSpent: 30000,
    duration: '8 weeks',
    remaining: 15000,
    paymentMethod: 'Financing',
    status: 'Active',
    amountDue: 15000,
    description:
      'Complete backyard transformation including patio installation, garden beds, and irrigation.',
  },
]
