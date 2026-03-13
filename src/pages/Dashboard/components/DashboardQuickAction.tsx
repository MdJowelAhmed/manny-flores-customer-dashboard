import {
  ClipboardList,
  Clock,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react'
import { DashboardStatCard } from './DashboardStatCard'
import { quickActionStats } from '../dashboardOverviewData'

const quickActionCardsConfig = [
  {
    title: "Today's Tasks",
    value: quickActionStats.todaysTasks,
    icon: ClipboardList,
    iconBg: 'bg-blue-500',
    iconColor: 'text-white',
  },
  {
    title: 'Pending Tasks',
    value: quickActionStats.pendingTasks,
    icon: Clock,
    iconBg: 'bg-amber-500',
    iconColor: 'text-white',
  },
  {
    title: 'Attendance',
    value: quickActionStats.attendance,
    icon: CheckCircle2,
    iconBg: 'bg-green-500',
    iconColor: 'text-white',
  },
  {
    title: 'Assigned Projects',
    value: quickActionStats.assignedProjects,
    icon: FolderKanban,
    iconBg: 'bg-purple-500',
    iconColor: 'text-white',
  },
]

export function DashboardQuickAction() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-accent mb-4">Quick Action</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActionCardsConfig.map((item, index) => (
          <DashboardStatCard key={item.title} {...item} index={index} />
        ))}
      </div>
    </div>
  )
}
