import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { ProjectProgress, TaskPriority } from '../dashboardOverviewData'

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-gray-100 text-gray-700',
}

interface ProjectProgressListProps {
  projects: ProjectProgress[]
}

function ProjectProgressCardItem({ project }: { project: ProjectProgress }) {
  return (
    <Card className=" hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{project.projectName}</p>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mb-2',
                PRIORITY_STYLES[project.priority]
              )}
            >
              {project.priority}
            </span>
            <p className="font-semibold text-accent">{project.title}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-purple-600">
            {project.daysLeft} days left
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectProgressList({ projects }: ProjectProgressListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
    >
      <div className="border-gray-100">
        <h2 className="text-lg font-semibold text-accent mb-6">Project Progress</h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectProgressCardItem key={project.id} project={project} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
