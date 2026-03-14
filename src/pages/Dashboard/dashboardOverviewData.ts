export type TaskPriority = 'High' | 'Medium' | 'Low'
export type TaskStatus = 'In Progress' | 'Pending' | 'Completed'

export interface TodayTask {
  id: string
  projectName: string
  priority: TaskPriority
  title: string
  time: string
  status: TaskStatus
}

export interface ProjectProgress {
  id: string
  projectName: string
  priority: TaskPriority
  title: string
  daysLeft: number
}

export const todaysTasksData: TodayTask[] = [
  {
    id: '1',
    projectName: 'Riverside Park Project',
    priority: 'High',
    title: 'Lawn Mowing - Section A',
    time: '04:30 pm',
    status: 'In Progress',
  },
  {
    id: '2',
    projectName: 'Riverside Park Project',
    priority: 'Medium',
    title: 'Lawn Mowing - Section B',
    time: '04:30 pm',
    status: 'Pending',
  },
  {
    id: '3',
    projectName: 'Riverside Park Project',
    priority: 'Medium',
    title: 'Lawn Mowing - Section C',
    time: '04:30 pm',
    status: 'Pending',
  },
]

export const projectProgressData: ProjectProgress[] = [
  {
    id: '1',
    projectName: 'Riverside Park Project',
    priority: 'High',
    title: 'Lawn Mowing - Section A',
    daysLeft: 12,
  },
  {
    id: '2',
    projectName: 'Riverside Park Project',
    priority: 'High',
    title: 'Lawn Mowing - Section B',
    daysLeft: 12,
  },
  {
    id: '3',
    projectName: 'Riverside Park Project',
    priority: 'High',
    title: 'Lawn Mowing - Section C',
    daysLeft: 12,
  },
]

export const quickActionStats = {
  todaysTasks: 5,
  pendingTasks: 12,
  attendance: 'Present',
  assignedProjects: 3,
}

export const dailyWorkPeriod = {
  checkIn: '09:10 am',
  checkOut: '06:15 pm',
  workingPeriod: '1 hr 30 min',
}

// Dashboard overview stats
export const dashboardStats = {
  activeProjects: 39,
  pendingApprovals: 12,
}

// Upcoming inspections
export interface UpcomingInspection {
  id: string
  customerName: string
  inspectionType: string
  date: string
}

export const upcomingInspectionsData: UpcomingInspection[] = [
  { id: '1', customerName: 'Emily Davis', inspectionType: 'Final Inspection', date: 'Feb 17' },
  { id: '2', customerName: 'Sarah Johnson', inspectionType: 'Mid-Progress Check', date: 'Mar 07' },
  { id: '3', customerName: 'Robert Brown', inspectionType: 'Site Visit', date: 'Mar 17' },
  { id: '4', customerName: 'Emily Davis', inspectionType: 'Quality Review', date: 'Mar 22' },
]

// Recent project status
export type RecentProjectStatus = 'In Progress' | 'Pending Approval'

export interface RecentProject {
  id: string
  customerName: string
  projectName: string
  status: RecentProjectStatus
  progress: number
  value: string
}

export const recentProjectsData: RecentProject[] = [
  { id: '1', customerName: 'Emily Davis', projectName: 'Garden Design & Installation', status: 'In Progress', progress: 87, value: '€12,560' },
  { id: '2', customerName: 'Emily Davis', projectName: 'Front Yard Landscaping', status: 'Pending Approval', progress: 0, value: '€12,560' },
  { id: '3', customerName: 'Emily Davis', projectName: 'Patio & Deck Construction', status: 'In Progress', progress: 45, value: '€12,560' },
  { id: '4', customerName: 'Emily Davis', projectName: 'Backyard Renovation', status: 'In Progress', progress: 87, value: '€12,560' },
  ...Array.from({ length: 7 }, (_, i) => ({
    id: String(i + 5),
    customerName: 'Emily Davis',
    projectName: 'Lawn Maintenance Setup',
    status: 'In Progress' as const,
    progress: 75,
    value: '€12,560',
  })),
]
