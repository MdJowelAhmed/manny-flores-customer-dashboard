import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ClipboardList,
  Clock,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react'
import { DashboardStatCard } from './DashboardStatCard'
import { quickActionStats } from '../dashboardOverviewData'

export function DashboardQuickAction() {
  const { t } = useTranslation()

  const quickActionCardsConfig = useMemo(() => [
    {
      title: t('dashboard.todaysTasks'),
      value: quickActionStats.todaysTasks,
      icon: ClipboardList,
      iconBg: 'bg-blue-500',
      iconColor: 'text-white',
    },
    {
      title: t('dashboard.pendingTasks'),
      value: quickActionStats.pendingTasks,
      icon: Clock,
      iconBg: 'bg-amber-500',
      iconColor: 'text-white',
    },
    {
      title: t('dashboard.attendance'),
      value: quickActionStats.attendance,
      icon: CheckCircle2,
      iconBg: 'bg-green-500',
      iconColor: 'text-white',
    },
    {
      title: t('dashboard.assignedProjects'),
      value: quickActionStats.assignedProjects,
      icon: FolderKanban,
      iconBg: 'bg-purple-500',
      iconColor: 'text-white',
    },
  ], [t])

  return (
    <div>
      <h3 className="text-lg font-semibold text-accent mb-4">{t('dashboard.quickAction')}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActionCardsConfig.map((item, index) => (
          <DashboardStatCard key={item.title} {...item} index={index} />
        ))}
      </div>
    </div>
  )
}
