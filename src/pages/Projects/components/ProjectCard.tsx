import { Eye, Star, Trash2, MapPin, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { STATUS_COLORS } from '@/utils/constants'
import { cn } from '@/utils/cn'
import type { Project } from '../projectsData'

interface ProjectCardProps {
  project: Project
  onViewDetails: (project: Project) => void
  onRating: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectCard({
  project,
  onViewDetails,
  onRating,
  onDelete,
}: ProjectCardProps) {
  const statusConfig = STATUS_COLORS[project.status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
  }

  return (
    <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-4">
        {/* Header: project name, customer, ID, status, actions */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-800 truncate">
                {project.projectName}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {project.customerName}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => onRating(project)}
                className="flex items-center gap-1 text-muted-foreground hover:text-amber-500 transition-colors"
                aria-label="Rating"
              >
                <Star className="h-4 w-4" />
                <span className="text-xs">Rating</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(project)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-sm font-medium text-purple-600">
            Project ID: {project.id}
          </p>
          <span
            className={cn(
              'inline-flex rounded-full px-3 py-1 text-xs font-medium',
              statusConfig.bg,
              statusConfig.text
            )}
          >
            {project.status}
          </span>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">Progress</span>
            <span className="font-medium text-gray-800">{project.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{project.location}</span>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>{project.dateRange}</span>
        </div>

        {/* Project value & View Details */}
        <div className="flex items-end justify-between pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-muted-foreground">Project Value</p>
            <p className="font-semibold text-gray-800">{project.projectValue}</p>
          </div>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
            onClick={() => onViewDetails(project)}
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
