import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { DailyChecklistItem } from '../safetyComplianceData'
import { cn } from '@/utils/cn'

interface DailyChecklistCardProps {
  item: DailyChecklistItem
  onCheck: (item: DailyChecklistItem) => void
}

export function DailyChecklistCard({ item, onCheck }: DailyChecklistCardProps) {
  const { t } = useTranslation()
  return (
    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <p className="font-medium text-foreground">
          {item.order}. {item.projectName}
        </p>
        {item.isCompleted ? (
          <span className="text-green-600 text-sm font-medium shrink-0">{t('safety.completed')}</span>
        ) : (
          <Button
            size="sm"
            className={cn(
              'shrink-0 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg font-medium h-8'
            )}
            onClick={() => onCheck(item)}
          >
            {t('safety.check')}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
