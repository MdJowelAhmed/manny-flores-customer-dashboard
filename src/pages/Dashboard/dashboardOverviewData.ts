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
