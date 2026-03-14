import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import type { RecentProject } from './dashboardOverviewData'

interface RecentProjectsTableProps {
  projects: RecentProject[]
  onView?: (project: RecentProject) => void
  onDelete?: (project: RecentProject) => void
  maxRows?: number
}

const STATUS_STYLES: Record<string, string> = {
  'In Progress': 'bg-purple-100 text-purple-700',
  'Pending Approval': 'bg-orange-100 text-orange-700',
}

export function RecentProjectsTable({
  projects,
  onView,
  onDelete,
  maxRows = 5,
}: RecentProjectsTableProps) {
  const { t } = useTranslation()
  const displayProjects = projects.slice(0, maxRows)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="w-full"
    >
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {t('dashboard.recentProjects')}
            </CardTitle>
            <Link
              to="/recent-projects"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t('dashboard.viewAll')}
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary-foreground text-accent border-b">
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                    {t('dashboard.customerName')}
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                    {t('dashboard.project')}
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">
                    {t('dashboard.status')}
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">
                    {t('dashboard.progress')}
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">
                    {t('dashboard.value')}
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700 w-24">
                    {t('dashboard.action')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">#{project.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {project.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {project.projectName ?? (project as { project?: string }).project ?? ''}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                          STATUS_STYLES[project.status] ?? 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="flex-1 max-w-[80px] h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-10">
                          {project.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right font-medium">
                      {project.value}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-primary"
                          onClick={() => onView?.(project)}
                          asChild
                        >
                          <Link to={`/recent-projects?view=${project.id}`}>
                            <Eye className="h-5 w-5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-destructive"
                          onClick={() => onDelete?.(project)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
