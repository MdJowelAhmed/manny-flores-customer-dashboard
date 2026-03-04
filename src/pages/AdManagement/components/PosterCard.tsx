import { Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Poster } from '@/types'
import { cn } from '@/utils/cn'

interface PosterCardProps {
  poster: Poster
  onDelete: (poster: Poster) => void
  className?: string
}

export function PosterCard({ poster, onDelete, className }: PosterCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="relative aspect-[4/3] bg-muted">
        <img
          src={poster.imageUrl}
          alt={poster.title}
          className="h-full w-full object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md opacity-90 hover:opacity-100"
          onClick={() => onDelete(poster)}
          title="Delete poster"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-800/90">
          Special Offer
        </p>
        <h3 className="text-xl font-bold text-slate-800 italic">
          {poster.title}
        </h3>
        {poster.description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {poster.description}
          </p>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-amber-700/40 text-amber-800 hover:bg-amber-50"
        >
          More info
        </Button>
      </CardContent>
    </Card>
  )
}
