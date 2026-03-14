import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Clock } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { TodayTask, TaskPriority } from '../dashboardOverviewData'

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-gray-100 text-gray-700',
}

const STATUS_STYLES: Record<string, string> = {
  'In Progress': 'bg-blue-100 text-blue-700',
  Pending: 'bg-amber-100 text-amber-700',
  Completed: 'bg-green-100 text-green-700',
}

interface TodayTasksProps {
  tasks: TodayTask[]
}

function TodayTaskCardItem({ task }: { task: TodayTask }) {
  return (
    <Card className=" hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{task.projectName}</p>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  PRIORITY_STYLES[task.priority]
                )}
              >
                {task.priority}
              </span>
            </div>
            <p className="font-semibold text-accent mb-2">{task.title}</p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {task.time}
            </div>
          </div>
          <span
            className={cn(
              'shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
              STATUS_STYLES[task.status] ?? 'bg-gray-100 text-gray-700'
            )}
          >
            {task.status}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function TodayTasks({ tasks }: TodayTasksProps) {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="border-gray-100">
    
          <h2 className="text-lg font-semibold text-accent mb-6">{t('dashboard.todaysTask')}</h2>
   
        <div className="space-y-4">
          {tasks.map((task) => (
            <TodayTaskCardItem key={task.id} task={task} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
