import { useState } from 'react'
import { BarChart3, Clock } from 'lucide-react'
import {
  dashboardStats,
  upcomingInspectionsData,
} from './dashboardOverviewData'
import { DashboardStatCard } from './components'
import { ProjectStatusOverviewChart } from './ProjectStatusOverviewChart'
import { UpcomingInspections } from './UpcomingInspections'
import { ConfirmDialog } from '@/components/common'
import { toast } from 'sonner'
import type { RecentProject } from './dashboardOverviewData'
import { useOverviewProjectStatusQuery, useOverviewRecentActivitiesQuery, useOverviewStatsQuery } from '@/redux/slices/customer/overviewApi'
import Spinner from '@/components/common/Spinner'
import { RecentProjectsTable } from './components/RecentProjectsTable'

export default function Dashboard() {
  const [deleteProject, setDeleteProject] = useState<RecentProject | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Api calls
  const { data: overviewStats, isLoading: isLoadingOverviewStats } = useOverviewStatsQuery()
  const { data: overviewProjectStatus, isLoading: isLoadingOverviewProjectStatus } = useOverviewProjectStatusQuery()

  const { data: overviewRecentActivities, isLoading: isLoadingOverviewRecentActivities } = useOverviewRecentActivitiesQuery()


  const handleDeleteProject = async () => {
    if (!deleteProject) return
    setIsDeleting(true)
    try {
      // Simulate API call - replace with actual delete API
      await new Promise((r) => setTimeout(r, 500))
      toast.success('Project deleted successfully')
      setDeleteProject(null)
    } catch {
      toast.error('Failed to delete project')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoadingOverviewStats || isLoadingOverviewProjectStatus || isLoadingOverviewRecentActivities) {
    return <Spinner />
  }

  return (
    <div className="space-y-6">
      {/* Top - Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <DashboardStatCard
          title="Active Projects"
          value={overviewStats?.data?.activeProjectsLength}
          icon={BarChart3}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          index={0}
        />
        <DashboardStatCard
          title="Pending Approvals"
          value={dashboardStats?.pendingApprovals}
          icon={Clock}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          index={1}
        />
      </div>

      {/* Middle - Project status overview & Upcoming Inspections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-1">
          <ProjectStatusOverviewChart overviewProjectStatus={overviewProjectStatus} />
        </div>
        <div>
          <UpcomingInspections inspections={upcomingInspectionsData} overviewRecentActivities={overviewRecentActivities} />
        </div>
      </div>

      {/* Bottom - Recent Projects Table */}
      <RecentProjectsTable />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteProject?.projectName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
