import { Calendar, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { formatDateDayMonth } from '@/utils/formatters'
import { parseISO } from 'date-fns'
import type { MyTask } from '../myTaskData'

interface TaskCardProps {
  task: MyTask
  onViewDetails: (task: MyTask) => void
  onStart?: (task: MyTask) => void
}

const priorityClasses: Record<string, string> = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-gray-100 text-gray-700',
}

export function TaskCard({ task, onViewDetails, onStart }: TaskCardProps) {
  const isInProgress = task.status === 'In Progress'
  const isCompleted = task.status === 'Completed'
  const primaryButtonText = isCompleted ? 'Completed' : isInProgress ? 'Complete' : 'Start'

  return (
    <Card className="rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-accent">{task.projectName}</h3>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                priorityClasses[task.priority] ?? 'bg-gray-100 text-gray-700'
              )}
            >
              {task.priority}
            </span>
          </div>
          {isInProgress && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 shrink-0">
              In Progress
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          <span className="font-medium text-foreground">Task Name: </span>
          {task.taskName}
        </p>

        <div className="space-y-5 mb-3">
          <div className="flex flex-col  gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="bg-secondary-foreground p-1 rounded-full">
              <Calendar className="h-4 w-4 text-success shrink-0   " />
              </div>
              <span className="font-medium text-foreground">Deadline </span>
            </div>
            <span>

              {formatDateDayMonth(parseISO(task.deadline))}
            </span>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
             <div className="bg-secondary-foreground p-1 rounded-full">
             <MapPin className="h-4 w-4 text-success shrink-0 mt-0.5   " />
             </div>
              <span className="font-medium text-foreground">Location </span>
            </div>
            <span>

              {task.location}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-medium text-foreground mb-1">Description:</p>
          <p className="text-sm text-muted-foreground line-clamp-3">{task.description}</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant={isInProgress ? 'outline' : 'outline'}
            size="sm"
            className={cn(
              'flex-1 rounded-lg',
              isInProgress ? 'border-primary text-accent' : 'border-primary text-accent'
            )}
            onClick={() => (onStart ?? onViewDetails)(task)}
            disabled={isCompleted}
          >
            {primaryButtonText}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-lg border-success text-secondary hover:bg-success/10"
            onClick={() => onViewDetails(task)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
