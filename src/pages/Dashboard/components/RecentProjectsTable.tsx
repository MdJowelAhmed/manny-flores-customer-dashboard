import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import Spinner from '@/components/common/Spinner'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useTranslation } from 'react-i18next'
import { useOverviewRecentProjectsQuery } from '@/redux/slices/customer/overviewApi'
import { ProjectViewDetailsModal } from './ProjectViewDetailsModal'


const PROJECT_STATUS_HEX: Record<any, string> = {
    Completed: '#00A63E',
    'In Progress': '#FFCC00',
    Scheduled: '#3B82F6',
    Overdue: '#FF383C',
    'Pending Approval': '#F59E0B',
}

export function getProjectStatusBadgeStyle(
    status: any['status']
): any {
    const hex = PROJECT_STATUS_HEX[status] || '#6B7280'
    const backgroundColor = `${hex}26`

    const color =
        status === 'In Progress' || status === 'Pending Approval'
            ? '#3D3300' /* readable on light yellow/amber */
            : hex

    return {
        backgroundColor,
        color,
    }
}

/** i18n keys under `recentProjectsPage` */
export function getProjectStatusTranslationKey(
    status: any
): `recentProjectsPage.${string}` {
    switch (status) {
        case 'Completed':
            return 'recentProjectsPage.completed'
        case 'In Progress':
            return 'recentProjectsPage.inProgress'
        case 'Scheduled':
            return 'recentProjectsPage.scheduled'
        case 'Overdue':
            return 'recentProjectsPage.overdue'
        case 'Pending Approval':
            return 'recentProjectsPage.pendingApproval'
        default:
            return 'recentProjectsPage.scheduled'
    }
}


export function RecentProjectsTable() {
    const navigate = useNavigate()

    const [showViewModal, setShowViewModal] = useState(false)
    // const [showPlanModal, setShowPlanModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedProject, setSelectedProject] = useState<any | null>(
        null
    )
    const { t } = useTranslation()
    const [deletedIds, setDeletedIds] = useState<string[]>([])

    // API CALLS
    const { data: recentProjectsApi, isLoading: recentProjectsLoading } = useOverviewRecentProjectsQuery({ limit: 10, page: 1 })

    const apiData = recentProjectsApi?.data || []
    console.log(apiData)
    const mappedProjects = apiData.map((item: any) => {
        const mapStatus = (status: string): any => {
            switch (status) {
                case 'COMPLETED':
                    return 'Completed'
                case 'IN_PROGRESS':
                    return 'In Progress'
                case 'SCHEDULED':
                    return 'Scheduled'
                case 'PENDING':
                    return 'Pending Approval'
                default:
                    return 'Scheduled'
            }
        }
        return {
            id: item.id ? (item.id.includes('-') ? `#${item.id.split('-')[0]}` : `#${item.id.slice(0, 8)}`) : '#N/A',
            customerName: item.customerName || 'N/A',
            project: item.projectName || 'N/A',
            status: mapStatus(item.projectStatus),
            progress: item.projectStatus === 'COMPLETED' ? 100 : item.projectStatus === 'IN_PROGRESS' ? 60 : item.projectStatus === 'PENDING' ? 15 : 0,
            value: item.totalCost ? `$${item.totalCost}` : '$0',
            startDate: item.estimateStartDate ? new Date(item.estimateStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.') : 'N/A',
            endDate: item.estimateEndDate ? new Date(item.estimateEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.') : 'N/A',
            email: item.customerEmail,
            company: item.customerName,
            projectName: item.projectName,
            description: item.description,
            planFiles: [],
            originalId: item.id
        }
    })

    const visibleProjects = mappedProjects.filter((p: any) => !deletedIds.includes(p.originalId))

    const handleViewDetails = (project: any) => {
        setSelectedProject(project)
        setShowViewModal(true)
    }

    // const handleDeleteClick = (project: any) => {
    //     setSelectedProject(project)
    //     setShowDeleteModal(true)
    // }

    const handleConfirmDelete = () => {
        if (!selectedProject) return
        // removeProject(selectedProject.id)
        const proj = selectedProject as any
        if (proj.originalId) {
            setDeletedIds(prev => [...prev, proj.originalId])
        }
        setShowDeleteModal(false)
        setSelectedProject(null)
        navigate('/recent-projects')
    }

    const resolvedViewProject: any | null = selectedProject
        ? (visibleProjects.find((p: any) => p.id === selectedProject.id) as any) ?? selectedProject
        : null

    if (recentProjectsLoading) {
        return (
            <div className="flex items-center justify-center p-12 bg-white rounded-lg border-none min-h-[300px] shadow-sm">
                <Spinner />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="col-span-1 border-none shadow-sm"
        >
            <Card className="bg-white border-0">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                    <CardTitle className="text-xl font-bold text-slate-800">{t('dashboard.recentProjects')}</CardTitle>

                </CardHeader>
                <CardContent className="p-0">
                    <div className="w-full overflow-auto">
                        <table className="w-full min-w-[1180px]">
                            <thead>
                                <tr className="bg-gray-50/80 text-slate-800 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.id')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.customerName')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.project')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.startDate')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.endDate')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.status')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-slate-700">
                                {visibleProjects?.slice(0, 4).map((project: any, index: any) => (
                                    <motion.tr
                                        key={`${project.id}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="hover:bg-gray-50/50 shadow"
                                    >
                                        <td className="px-6 py-5 text-sm font-medium">
                                            {project.id}
                                        </td>
                                        <td className="px-6 py-5 text-sm">
                                            {project.customerName}
                                        </td>
                                        <td className="px-6 py-5 text-sm">
                                            {project.project}
                                        </td>
                                        <td className="px-6 py-5 text-sm whitespace-nowrap">
                                            {project.startDate}
                                        </td>
                                        <td className="px-6 py-5 text-sm whitespace-nowrap">
                                            {project.endDate}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span
                                                className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium"
                                                style={getProjectStatusBadgeStyle(
                                                    project.status
                                                )}
                                            >
                                                {t(getProjectStatusTranslationKey(project.status))}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewDetails(project)
                                                    }
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    aria-label="View details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                {/* <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteClick(project)
                                                    }
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button> */}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <ProjectViewDetailsModal
                open={showViewModal}
                onClose={() => {
                    setShowViewModal(false)
                    setSelectedProject(null)
                }}
                project={resolvedViewProject}
                onRemovePlanFile={
                    resolvedViewProject
                        ? () => { }
                        : undefined
                }
            />

            <ConfirmDialog
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setSelectedProject(null)
                }}
                onConfirm={handleConfirmDelete}
                title={t('common.areYouSure')}
                description={t('common.deleteConfirmation')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                variant="danger"
            />
        </motion.div>
    )
}
