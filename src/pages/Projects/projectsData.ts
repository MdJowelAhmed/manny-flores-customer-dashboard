import { addDays as addDaysFns, format, parseISO } from 'date-fns'

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
  description?: string
  /** ISO yyyy-MM-dd */
  startDate?: string
  endDate?: string
  paymentMethod?: string
  amountDue?: string
  paymentAmount?: string
  paymentDate?: string
  paymentStatus?: string
}

export function formatProjectDisplayDate(iso?: string): string {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), 'dd/MM/yy')
  } catch {
    return iso
  }
}

function addDays(iso: string, days: number): string {
  return format(addDaysFns(parseISO(iso), days), 'yyyy-MM-dd')
}

const TEMPLATES: Omit<
  Project,
  'id' | 'startDate' | 'endDate' | 'dateRange'
>[] = [
  {
    projectName: 'Garden Design & Installation',
    category: 'Garden Design & Installation',
    customerName: 'Lisa Anderson',
    status: 'Completed',
    progress: 100,
    location: '123 Oak Street, Springfield',
    projectValue: '$12,589',
    description:
      'Complete lawn mowing for Section A of Riverside Park. Ensure edges are trimmed and all grass clippings are collected.',
    paymentMethod: 'Cash',
    amountDue: '€0',
    paymentAmount: '€12,589',
    paymentDate: '22/01/2026',
    paymentStatus: 'Paid',
  },
  {
    projectName: 'Front Yard Landscaping',
    category: 'Front Yard Landscaping',
    customerName: 'Michael Chen',
    status: 'Pending Approval',
    progress: 68,
    location: '456 Maple Ave, Springfield',
    projectValue: '$22,089',
    description:
      'Complete backyard transformation including new patio installation, garden bed setup, and decorative landscaping.',
    paymentMethod: 'Cash',
    amountDue: '€13,000',
    paymentAmount: '€9,099',
    paymentDate: '22/01/2026',
    paymentStatus: 'Partial',
  },
  {
    projectName: 'Backyard Renovation',
    category: 'Backyard Renovation',
    customerName: 'Sarah Johnson',
    status: 'In Progress',
    progress: 75,
    location: '789 Pine Rd, Springfield',
    projectValue: '$12,589',
    description:
      'Full backyard overhaul with new sod, planting beds, and fire pit area. Modern design with native plants.',
    paymentMethod: 'Cash',
    amountDue: '€5,000',
    paymentAmount: '€7,589',
    paymentDate: '15/01/2026',
    paymentStatus: 'Partial',
  },
  {
    projectName: 'Pool Landscaping',
    category: 'Pool Landscaping',
    customerName: 'Robert Brown',
    status: 'Scheduled',
    progress: 26,
    location: '321 Elm St, Springfield',
    projectValue: '$22,089',
    description:
      'In-ground pool with integrated spa, decking, and landscaping. Custom lighting and water features included.',
    paymentMethod: 'Card',
    amountDue: '€22,089',
    paymentAmount: '€0',
    paymentDate: '-',
    paymentStatus: 'Pending',
  },
  {
    projectName: 'Riverside Park Maintenance',
    category: 'Maintenance',
    customerName: 'City Parks Dept',
    status: 'In Progress',
    progress: 40,
    location: 'Riverside Park',
    projectValue: '$8,400',
    description:
      'Seasonal maintenance and replanting for central park zones. Includes irrigation checks.',
    paymentMethod: 'Wire',
    amountDue: '€2,000',
    paymentAmount: '€6,400',
    paymentDate: '10/01/2026',
    paymentStatus: 'Partial',
  },
]

/** 25 rows — 5 pages at 5 per page (matches dashboard mockup). */
export const projectsData: Project[] = Array.from({ length: 25 }, (_, i) => {
  const template = TEMPLATES[i % TEMPLATES.length]
  const cycle = Math.floor(i / TEMPLATES.length)
  const start = addDays('2026-01-02', i * 3)
  const end = addDays(start, 14 + (i % 10))
  const projectName =
    cycle > 0 ? `${template.projectName} (${cycle + 1})` : template.projectName

  return {
    ...template,
    id: String(i + 1),
    projectName,
    startDate: start,
    endDate: end,
    dateRange: `${formatProjectDisplayDate(start)} - ${formatProjectDisplayDate(end)}`,
  }
})
