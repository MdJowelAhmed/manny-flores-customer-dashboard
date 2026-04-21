import { useState } from 'react'
import { BarChart3, Clock } from 'lucide-react'
import {
  dashboardStats,
  upcomingInspectionsData,
  recentProjectsData,
} from './dashboardOverviewData'
import { DashboardStatCard } from './components'
import { ProjectStatusOverviewChart } from './ProjectStatusOverviewChart'
import { UpcomingInspections } from './UpcomingInspections'
import { RecentProjectsTable } from './RecentProjectsTable'
import { ConfirmDialog } from '@/components/common'
import { toast } from 'sonner'
import type { RecentProject } from './dashboardOverviewData'

export default function Dashboard() {
  const [deleteProject, setDeleteProject] = useState<RecentProject | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  return (
    <div className="space-y-6">
      {/* Top - Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <DashboardStatCard
          title="Active Projects"
          value={dashboardStats.activeProjects}
          icon={BarChart3}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          index={0}
        />
        <DashboardStatCard
          title="Pending Approvals"
          value={dashboardStats.pendingApprovals}
          icon={Clock}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          index={1}
        />
      </div>

      {/* Middle - Project status overview & Upcoming Inspections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-1">
          <ProjectStatusOverviewChart />
        </div>
        <div>
          <UpcomingInspections inspections={upcomingInspectionsData} />
        </div>
      </div>

      {/* Bottom - Recent Projects Table */}
      <RecentProjectsTable
        projects={recentProjectsData}
        onDelete={(p) => setDeleteProject(p)}
        maxRows={5}
      />

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
