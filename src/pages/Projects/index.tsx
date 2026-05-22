import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Pagination } from '@/components/common'
import { toast } from 'sonner'
import { formatProjectDisplayDate, type Project } from './projectsData'
import { ProjectDetailsModal } from './components/ProjectDetailsModal'
import { AddProjectModal, type AddProjectFormData } from './components/AddProjectModal'
import {
  mapProjectApiDocToUi,
  useGetProjectsQuery,
} from '@/redux/api/projectApi'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

const ITEMS_PER_PAGE = 10

function statusBadgeClass(status: Project['status']): string {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800'
    case 'In Progress':
      return 'bg-purple-100 text-purple-800'
    case 'Scheduled':
      return 'bg-amber-100 text-amber-900'
    case 'Cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-orange-100 text-orange-800'
  }
}

export default function Projects() {
  const { t } = useTranslation()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)

  const { data, isLoading, isError } = useGetProjectsQuery({
    page: currentPage,
    limit: itemsPerPage,
  })

  const projects = useMemo(
    () => (data?.data ?? []).map(mapProjectApiDocToUi),
    [data?.data]
  )

  const totalItems = data?.pagination?.total ?? projects.length
  const totalPages = Math.max(1, data?.pagination?.totalPage ?? 1)

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setCurrentPage(1)
  }, [totalPages, currentPage])

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setShowDetailsModal(true)
  }

  const handleAddRequest = (_data: AddProjectFormData) => {
    toast.message(
      t('projects.requestNotAvailable', {
        defaultValue: 'Project requests are not available yet. Contact your admin.',
      })
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t('projects.title', { defaultValue: 'Projects' })}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('projects.subtitle', {
                defaultValue:
                  'View your approved projects and full estimate details after invoice signing.',
              })}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-muted-foreground shadow-sm">
            {t('common.loading', { defaultValue: 'Loading...' })}
          </div>
        ) : isError ? (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-red-600 shadow-sm">
            {t('projects.loadError', { defaultValue: 'Failed to load projects' })}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-muted-foreground shadow-sm">
            {t('projects.noProjects')}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-2">{t('projects.projectName')}</th>
                    <th className="px-3 py-2">{t('projects.customer', { defaultValue: 'Customer' })}</th>
                    <th className="px-3 py-2">{t('projects.location', { defaultValue: 'Location' })}</th>
                    <th className="px-3 py-2">{t('projects.dates', { defaultValue: 'Dates' })}</th>
                    <th className="px-3 py-2">{t('projects.status', { defaultValue: 'Status' })}</th>
                    <th className="px-3 py-2">{t('projects.value', { defaultValue: 'Value' })}</th>
                    <th className="px-3 py-2 text-right">{t('common.action', { defaultValue: 'Action' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="rounded-lg bg-gray-50/70">
                      <td className="px-3 py-3">
                        <div className="text-sm font-semibold text-gray-900">{p.projectName}</div>
                        {p.hasSignature ? (
                          <span className="mt-1 inline-flex text-[11px] font-medium text-green-700">
                            {t('projects.signed', { defaultValue: 'Signed' })}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-800">{p.customerName}</div>
                        {p.customerEmail ? (
                          <div className="text-xs text-gray-500">{p.customerEmail}</div>
                        ) : null}
                      </td>
                      <td className="max-w-[180px] px-3 py-3 text-sm text-gray-600">
                        <span className="line-clamp-2">{p.location}</span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {formatProjectDisplayDate(p.startDate)} →{' '}
                        {formatProjectDisplayDate(p.endDate)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            statusBadgeClass(p.status)
                          )}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-[#22c55e]">
                        {p.projectValue}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 rounded-lg border-gray-300 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50"
                          onClick={() => handleViewDetails(p)}
                        >
                          {t('projects.viewDetails', { defaultValue: 'View Details' })}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(limit) => {
                  setItemsPerPage(limit)
                  setCurrentPage(1)
                }}
                showItemsPerPage
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
