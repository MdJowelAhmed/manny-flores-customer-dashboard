export interface RecentProject {
  id: string
  customerName: string
  project: string
  status: 'In Progress' | 'Pending Approval' | 'Completed'
  progress: number
  value: string
  // Extended fields for view details modal
  email?: string
  company?: string
  projectName?: string
  description?: string
}

export const recentProjectsData: RecentProject[] = [
  {
    id: '#1',
    customerName: 'Emily Davis',
    project: 'Garden Design & Installation',
    status: 'In Progress',
    progress: 92,
    value: '€12,560',
    email: 'emily@email.com',
    company: 'Garden Design & Installation',
    projectName: 'Residential Backyard Renovation',
    description:
      'Complete backyard transformation including patio installation, garden beds, irrigation system, and landscape lighting. Customer wants a modern outdoor living space with low-maintenance plants.',
  },
  {
    id: '#2',
    customerName: 'Michael Chen',
    project: 'Front Yard Landscaping',
    status: 'Pending Approval',
    progress: 0,
    value: '€12,560',
    email: 'michael@email.com',
    company: 'Front Yard Landscaping',
    projectName: 'Front Yard Landscaping',
    description:
      'Front yard redesign with new lawn, decorative shrubs, and pathway installation. Focus on curb appeal and low water usage.',
  },
  {
    id: '#3',
    customerName: 'Sarah Johnson',
    project: 'Patio & Deck Construction',
    status: 'In Progress',
    progress: 45,
    value: '€12,560',
    email: 'sarah@email.com',
    company: 'Patio & Deck Construction',
    projectName: 'Patio & Deck Construction',
    description:
      'Custom stone patio with built-in seating area and cedar deck extension. Includes outdoor lighting and railing installation.',
  },
  {
    id: '#4',
    customerName: 'Lisa Anderson',
    project: 'Backyard Renovation',
    status: 'In Progress',
    progress: 87,
    value: '€12,560',
    email: 'lisa@email.com',
    company: 'Backyard Renovation Co',
    projectName: 'Backyard Renovation',
    description:
      'Full backyard overhaul with new sod, planting beds, and fire pit area. Modern design with native plants.',
  },
  {
    id: '#5',
    customerName: 'John Williams',
    project: 'Pool & Spa Design',
    status: 'In Progress',
    progress: 65,
    value: '€28,900',
    email: 'john@email.com',
    company: 'Aqua Landscapes',
    projectName: 'Pool & Spa Design',
    description:
      'In-ground pool with integrated spa, decking, and landscaping. Custom lighting and water features included.',
  },
  {
    id: '#6',
    customerName: 'Maria Garcia',
    project: 'Commercial Landscaping',
    status: 'Completed',
    progress: 100,
    value: '€45,200',
    email: 'maria@email.com',
    company: 'Green Space Solutions',
    projectName: 'Office Park Landscaping',
    description:
      'Corporate campus landscaping with sustainable plants, irrigation systems, and outdoor seating areas.',
  },
]
