import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Pagination } from '@/components/common'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  projectsData as initialProjectsData,
  formatProjectDisplayDate,
  type Project,
} from './projectsData'
import { ProjectDetailsModal } from './components/ProjectDetailsModal'
import { AddProjectModal, type AddProjectFormData } from './components/AddProjectModal'

const ITEMS_PER_PAGE = 5

function nextProjectId(projects: Project[]): string {
  const nums = projects.map((p) => parseInt(p.id, 10)).filter((n) => !Number.isNaN(n))
  return String((nums.length ? Math.max(...nums) : 0) + 1)
}

export default function Projects() {
  const { t } = useTranslation()
  const [projects, setProjects] = useState<Project[]>(initialProjectsData)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const totalItems = projects.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return projects.slice(start, start + ITEMS_PER_PAGE)
  }, [projects, currentPage])

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setCurrentPage(1)
  }, [totalPages, currentPage])

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setShowDetailsModal(true)
  }

  const handleAddRequest = (data: AddProjectFormData) => {
    const id = nextProjectId(projects)
    const newProject: Project = {
      id,
      projectName: data.projectName.trim(),
      category: data.projectName.trim(),
      customerName: '—',
      status: 'Pending Approval',
      progress: 0,
      location: '—',
      dateRange: `${formatProjectDisplayDate(data.startDate)} - ${formatProjectDisplayDate(data.endDate)}`,
      projectValue: '—',
      description: data.description?.trim() || '',
      startDate: data.startDate,
      endDate: data.endDate,
    }
    setProjects((prev) => [newProject, ...prev])
    setCurrentPage(1)
    toast.success(t('projects.projectRequested'))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t('projects.projectName')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              After admin creates invoice, projects will appear here and you can track progress.
            </p>
          </div>
      
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-muted-foreground shadow-sm">
            {t('projects.noProjects')}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-2">Project</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Progress</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProjects.map((p) => (
                    <tr key={p.id} className="rounded-lg bg-gray-50/70">
                      <td className="px-3 py-3">
                        <div className="text-sm font-semibold text-gray-900">{p.projectName}</div>
                        <div className="text-xs text-gray-500">{p.customerName}</div>
                        <div className="mt-1 text-[11px] text-gray-400">
                          {formatProjectDisplayDate(p.startDate)} → {formatProjectDisplayDate(p.endDate)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700">{p.status}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-40 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-green-500"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-800">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 rounded-lg border-gray-300 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50"
                          onClick={() => handleViewDetails(p)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                showItemsPerPage={false}
                className="mt-2 border-0 px-0"
              />
            )}
          </div>
        )}
      </div>

      <AddProjectModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onRequest={handleAddRequest}
      />

      <ProjectDetailsModal
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
      />
    </div>
  )
}
