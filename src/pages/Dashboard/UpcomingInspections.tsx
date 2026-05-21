import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, FileCheck, FileText, Briefcase, CheckCircle2, XCircle, Bell, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import type { UpcomingInspection } from './dashboardOverviewData'

interface UpcomingInspectionsProps {
  inspections: UpcomingInspection[]
  overviewRecentActivities: any
}

function getActivityTheme(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase()
  
  if (text.includes('estimate')) {
    return {
      icon: FileText,
      bgColor: 'bg-purple-50 group-hover:bg-purple-100/80',
      iconColor: 'text-purple-600',
    }
  }
  if (text.includes('project')) {
    return {
      icon: Briefcase,
      bgColor: 'bg-blue-50 group-hover:bg-blue-100/80',
      iconColor: 'text-blue-600',
    }
  }
  if (text.includes('approve') || text.includes('completed') || text.includes('success')) {
    return {
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50 group-hover:bg-emerald-100/80',
      iconColor: 'text-emerald-600',
    }
  }
  if (text.includes('cancel') || text.includes('delete') || text.includes('reject')) {
    return {
      icon: XCircle,
      bgColor: 'bg-rose-50 group-hover:bg-rose-100/80',
      iconColor: 'text-rose-600',
    }
  }
  return {
    icon: Bell,
    bgColor: 'bg-amber-50 group-hover:bg-amber-100/80',
    iconColor: 'text-amber-600',
  }
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 24 
    } 
  }
}

export function UpcomingInspections({ inspections, overviewRecentActivities }: UpcomingInspectionsProps) {
  const { t } = useTranslation()
  
  const activities = overviewRecentActivities?.data || []
  const hasActivities = activities.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.35 }}
      className="w-full h-full"
    >
      <Card className="h-full border-none bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {hasActivities ? 'Recent Activities' : t('dashboard.upcomingInspections')}
            </CardTitle>
            {hasActivities ? (
              <Bell className="h-5 w-5 text-gray-400" />
            ) : (
              <Calendar className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasActivities ? (
            <motion.div 
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin"
            >
              {activities.map((activity: any) => {
                const theme = getActivityTheme(activity.title, activity.description)
                const IconComponent = theme.icon
                
                let relativeTime = ''
                try {
                  const date = new Date(activity.createdAt)
                  relativeTime = isNaN(date.getTime()) ? '' : formatDistanceToNow(date, { addSuffix: true })
                } catch {
                  // Fallback
                }

                return (
                  <motion.div
                    key={activity.id}
                    variants={itemVariants}
                    className="group relative flex items-start gap-4 rounded-xl border border-transparent p-3.5 transition-all duration-300 hover:border-gray-100 hover:bg-gray-50/50"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${theme.bgColor} ${theme.iconColor} shadow-sm group-hover:scale-105`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-800 text-[14px] leading-snug group-hover:text-indigo-600 transition-colors">
                          {activity.title}
                        </p>
                        {!activity.isRead && (
                          <span className="flex h-2 w-2 shrink-0 rounded-full bg-indigo-600 animate-pulse mt-1.5" title="Unread" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {activity.description}
                      </p>
                      
                      {relativeTime && (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400 mt-2.5">
                          <Clock className="h-3 w-3" />
                          <span>{relativeTime}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            // Backwards compatibility fallback if no activity feed is returned
            <div className="space-y-4">
              {inspections.length > 0 ? (
                inspections.map((inspection) => (
                  <div key={inspection.id} className="flex items-start gap-3 px-5 py-4 rounded-md border-b border-gray-100 last:border-0 bg-white">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">{inspection.customerName}</p>
                      <p className="text-sm text-gray-500">{inspection.inspectionType}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 flex-shrink-0">
                      <Calendar className="h-4 w-4" />
                      {inspection.date}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-gray-50 p-3 text-gray-400">
                    <Bell className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-600">No activities or inspections</p>
                  <p className="mt-1 text-xs text-gray-400">Everything looks quiet for now.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

