export type ProjectStatus =
  | 'Completed'
  | 'Pending Approval'
  | 'In Progress'
  | 'Scheduled'

export interface Project {
  id: string
  projectName: string
  category: string
  customerName: string
  status: ProjectStatus
  progress: number
  location: string
  dateRange: string
  projectValue: string
  // Extended for Project Details modal
  description?: string
  startDate?: string
  dueDate?: string
  paymentMethod?: string
  amountDue?: string
  paymentAmount?: string
  paymentDate?: string
  paymentStatus?: string
}

export const projectsData: Project[] = [
  {
    id: '#0001',
    projectName: 'Garden Design & Installation',
    category: 'Garden Design & Installation',
    customerName: 'Lisa Anderson',
    status: 'Completed',
    progress: 100,
    location: '123 Oak Street, Springfield',
    dateRange: '1/15/2026 - 2/28/2026',
    projectValue: '$12,589',
    description:
      'Complete backyard transformation including new patio installation, garden bed setup, lawn preparation, and decorative landscaping elements.',
    startDate: '1/15/2026',
    dueDate: '2/28/2026',
    paymentMethod: 'Cash',
    amountDue: '€0',
    paymentAmount: '€12,589',
    paymentDate: '22/01/2026',
    paymentStatus: 'Paid',
  },
  {
    id: '#0002',
    projectName: 'Front Yard Landscaping',
    category: 'Front Yard Landscaping',
    customerName: 'Michael Chen',
    status: 'Pending Approval',
    progress: 68,
    location: '123 Oak Street, Springfield',
    dateRange: '1/15/2026 - 2/28/2026',
    projectValue: '$22,089',
    description:
      'Front yard redesign with new lawn, decorative shrubs, and pathway installation. Focus on curb appeal and low water usage.',
    startDate: '1/15/2026',
    dueDate: '2/28/2026',
    paymentMethod: 'Cash',
    amountDue: '€13,000',
    paymentAmount: '€9,099',
    paymentDate: '22/01/2026',
    paymentStatus: 'Partial',
  },
  {
    id: '#0003',
    projectName: 'Backyard Renovation',
    category: 'Backyard Renovation',
    customerName: 'Sarah Johnson',
    status: 'In Progress',
    progress: 75,
    location: '123 Oak Street, Springfield',
    dateRange: '1/15/2026 - 2/28/2026',
    projectValue: '$12,589',
    description:
      'Full backyard overhaul with new sod, planting beds, and fire pit area. Modern design with native plants.',
    startDate: '1/15/2026',
    dueDate: '2/28/2026',
    paymentMethod: 'Cash',
    amountDue: '€5,000',
    paymentAmount: '€7,589',
    paymentDate: '15/01/2026',
    paymentStatus: 'Partial',
  },
  {
    id: '#0004',
    projectName: 'Pool Landscaping',
    category: 'Pool Landscaping',
    customerName: 'Robert Brown',
    status: 'Scheduled',
    progress: 26,
    location: '123 Oak Street, Springfield',
    dateRange: '1/15/2026 - 2/28/2026',
    projectValue: '$22,089',
    description:
      'In-ground pool with integrated spa, decking, and landscaping. Custom lighting and water features included.',
    startDate: '1/15/2026',
    dueDate: '2/28/2026',
    paymentMethod: 'Card',
    amountDue: '€22,089',
    paymentAmount: '€0',
    paymentDate: '-',
    paymentStatus: 'Pending',
  },
]
