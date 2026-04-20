import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, Trash2 } from 'lucide-react'
import { ConfirmDialog, Pagination } from '@/components/common'
import { Button } from '@/components/ui/button'
import { truncateText } from '@/utils/formatters'
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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
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

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (!selectedProject) return
    setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id))
    setSelectedProject(null)
    setShowDeleteModal(false)
    toast.success(t('projects.projectDeleted'))
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
      <div className="rounded-2xl border border-gray-100 bg-white  shadow-sm ">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6">
          <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
            {t('projects.pageTitle')}
          </h1>
          <Button
            type="button"
            className="w-full rounded-md px-5 text-white sm:w-auto"
            onClick={() => setShowAddModal(true)}
          >
            {t('projects.addProject')}
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">{t('projects.noProjects')}</div>
        ) : (
          <>
        <div className="overflow-x-auto  border border-gray-100">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100">
                <th className="px-4 py-3.5 font-semibold text-gray-800">{t('projects.colId')}</th>
                <th className="px-4 py-3.5 font-semibold text-gray-800">
                  {t('projects.colProject')}
                </th>
                <th className="px-4 py-3.5 font-semibold text-gray-800">
                  {t('projects.startDate')}
                </th>
                <th className="px-4 py-3.5 font-semibold text-gray-800">
                  {t('projects.endDate')}
                </th>
                <th className="px-4 py-3.5 font-semibold text-gray-800">
                  {t('projects.colDescription')}
                </th>
                <th className="px-4 py-3.5 text-center font-semibold text-gray-800">
                  {t('projects.colAction')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-gray-100 bg-white last:border-b-0 hover:bg-gray-50/80"
                >
                  <td className="px-4 py-4 font-medium text-gray-800">#{project.id}</td>
                  <td className="px-4 py-4 text-gray-800">{project.projectName}</td>
                  <td className="px-4 py-4 text-gray-700">
                    {formatProjectDisplayDate(project.startDate)}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {formatProjectDisplayDate(project.endDate)}
                  </td>
                  <td className="max-w-[200px] px-4 py-4 text-gray-600">
                    {truncateText(project.description || '—', 48)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(project)}
                        className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                        aria-label={t('projects.viewDetails')}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(project)}
                        className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        aria-label={t('projects.deleteProject')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalItems > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            showItemsPerPage={false}
            variant="simple"
            className="mt-2 justify-end border-0 px-0"
          />
        )}
          </>
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

      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedProject(null)
        }}
        onConfirm={handleConfirmDelete}
        title={t('projects.deleteTitle')}
        description={t('projects.deleteDescription')}
        confirmText={t('projects.confirmDelete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  )
}
