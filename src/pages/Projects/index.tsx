import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SearchInput, FilterDropdown, ConfirmDialog, Pagination } from '@/components/common'
import { PROJECT_STATUS_OPTIONS } from '@/utils/constants'
import { projectsData, type Project } from './projectsData'
import { ProjectCard } from './components/ProjectCard'
import { ProjectDetailsModal } from './components/ProjectDetailsModal'
import { RatingFeedbackModal } from './components/RatingFeedbackModal'

export default function Projects() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [projects, setProjects] = useState<Project[]>(projectsData)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(4)

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !search ||
        p.projectName.toLowerCase().includes(search.toLowerCase()) ||
        p.customerName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, search, statusFilter])

  const totalItems = filteredProjects.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProjects.slice(start, start + itemsPerPage)
  }, [filteredProjects, currentPage, itemsPerPage])

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setCurrentPage(1)
  }, [totalPages, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setShowDetailsModal(true)
  }

  const handleRating = (project: Project) => {
    setSelectedProject(project)
    setShowRatingModal(true)
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
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t('projects.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('projects.subtitle')}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('projects.searchPlaceholder')}
            className="w-full sm:w-64"
          />
          <FilterDropdown
            value={statusFilter}
            options={PROJECT_STATUS_OPTIONS}
            onChange={setStatusFilter}
            placeholder={t('projects.allStatus')}
            className="w-full sm:w-40"
          />
        </div>
      </div>

      {/* Project cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paginatedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onViewDetails={handleViewDetails}
            onRating={handleRating}
            onDelete={handleDeleteClick}
          />
        ))}
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
        />
      )}

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {t('projects.noProjects')}
        </div>
      )}

      {/* Modals */}
      <ProjectDetailsModal
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
      />

      <RatingFeedbackModal
        open={showRatingModal}
        onClose={() => {
          setShowRatingModal(false)
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
        confirmText="Delete"
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  )
}
