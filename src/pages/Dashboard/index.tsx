import { format } from 'date-fns'
import { useAppSelector } from '@/redux/hooks'
import {
  dailyWorkPeriod,
  todaysTasksData,
  projectProgressData,
} from './dashboardOverviewData'
import {
  DashboardQuickAction,
  TodayTasks,
  ProjectProgressList,
} from './components'

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth)
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim() || 'Employee'
    : 'Employee'

  return (
    <div className="space-y-6">
      {/* Welcome & Daily Work Period */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-md shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-accent">
            Welcome! <span className="text-primary">{displayName}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(new Date(), 'd MMMM, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-4 md:gap-6 p-4 rounded-xl ">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">Check In</span> 
            <span className="font-semibold text-accent">{dailyWorkPeriod.checkIn}</span>
          </div>
          <div className="h-10 w-[3px] bg-green-500" />
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">Check Out</span>
            <span className="font-semibold text-accent">{dailyWorkPeriod.checkOut}</span>
          </div>
          <div className="h-10 w-[3px] bg-amber-500" />
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">Today Working Period</span>
            <span className="font-semibold text-accent">{dailyWorkPeriod.workingPeriod}</span>
          </div>
        </div>
      </div>

      {/* Quick Action - Stat Cards */}
      <DashboardQuickAction />

      {/* Today's Task & Project Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TodayTasks tasks={todaysTasksData} />
        <ProjectProgressList projects={projectProgressData} />
      </div>
    </div>
  )
}
