export type EstimateStatus = 'Approved' | 'Pending' | 'Draft' | 'Follow Up'

export interface Estimate {
  id: string
  estimateCode: string
  project: string
  amount: string
  status: EstimateStatus
  startDate: string
  // For view/edit modals
  customerName: string
  email: string
  company: string
  startDateFormatted?: string
  amountDue?: string
}

export const estimatesData: Estimate[] = [
  {
    id: '1',
    estimateCode: 'EST-2026-001',
    project: 'Garden Design & Installation',
    amount: '€12,560',
    status: 'Approved',
    startDate: '1/10/2026',
    customerName: 'Sarah Johnson',
    email: 'sarah@email.com',
    company: 'Lawn Care Package',
    startDateFormatted: 'January 15, 2026',
    amountDue: '$45,000',
  },
  {
    id: '2',
    estimateCode: 'EST-2026-002',
    project: 'Backyard Renovation',
    amount: '€18,960',
    status: 'Follow Up',
    startDate: '3/10/2026',
    customerName: 'Michael Chen',
    email: 'michael@email.com',
    company: 'Green Space Solutions',
    startDateFormatted: 'March 3, 2026',
    amountDue: '$18,960',
  },
  {
    id: '3',
    estimateCode: 'EST-2026-003',
    project: 'Front Yard Landscaping',
    amount: '€17,160',
    status: 'Approved',
    startDate: '5/10/2026',
    customerName: 'Lisa Anderson',
    email: 'lisa@email.com',
    company: 'Lawn Care Package',
    startDateFormatted: 'May 5, 2026',
    amountDue: '$17,160',
  },
  {
    id: '4',
    estimateCode: 'EST-2026-004',
    project: 'Patio & Deck Construction',
    amount: '€16,500',
    status: 'Draft',
    startDate: '15/10/2026',
    customerName: 'Emily Davis',
    email: 'emily@email.com',
    company: 'Outdoor Living Co',
    startDateFormatted: 'October 15, 2026',
    amountDue: '$16,500',
  },
  {
    id: '5',
    estimateCode: 'EST-2026-005',
    project: 'Pool Landscaping',
    amount: '€14,990',
    status: 'Pending',
    startDate: '19/10/2026',
    customerName: 'Robert Brown',
    email: 'robert@email.com',
    company: 'Aqua Landscapes',
    startDateFormatted: 'October 19, 2026',
    amountDue: '$14,990',
  },
  {
    id: '6',
    estimateCode: 'EST-2026-006',
    project: 'Commercial Landscaping',
    amount: '€19,250',
    status: 'Approved',
    startDate: '21/10/2026',
    customerName: 'Maria Garcia',
    email: 'maria@email.com',
    company: 'Green Space Solutions',
    startDateFormatted: 'October 21, 2026',
    amountDue: '$19,250',
  },
  {
    id: '7',
    estimateCode: 'EST-2026-007',
    project: 'Irrigation System',
    amount: '€8,750',
    status: 'Follow Up',
    startDate: '29/10/2026',
    customerName: 'John Williams',
    email: 'john@email.com',
    company: 'Lawn Care Package',
    startDateFormatted: 'October 29, 2026',
    amountDue: '$8,750',
  },
  {
    id: '8',
    estimateCode: 'EST-2026-008',
    project: 'Driveway Paving',
    amount: '€22,400',
    status: 'Draft',
    startDate: '2/11/2026',
    customerName: 'Sarah Johnson',
    email: 'sarah@email.com',
    company: 'Lawn Care Package',
    startDateFormatted: 'November 2, 2026',
    amountDue: '$22,400',
  },
  {
    id: '9',
    estimateCode: 'EST-2026-009',
    project: 'Fence Installation',
    amount: '€11,200',
    status: 'Pending',
    startDate: '5/11/2026',
    customerName: 'Mike Johnson',
    email: 'mike@email.com',
    company: 'Lawn Care Package',
    startDateFormatted: 'November 5, 2026',
    amountDue: '$11,200',
  },
  {
    id: '10',
    estimateCode: 'EST-2026-010',
    project: 'Tree Removal & Planting',
    amount: '€9,500',
    status: 'Approved',
    startDate: '10/11/2026',
    customerName: 'Lisa Anderson',
    email: 'lisa@email.com',
    company: 'Green Space Solutions',
    startDateFormatted: 'November 10, 2026',
    amountDue: '$9,500',
  },
]
