import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, FileCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { UpcomingInspection } from './dashboardOverviewData'

interface UpcomingInspectionsProps {
  inspections: UpcomingInspection[]
}

function InspectionItem({ inspection }: { inspection: UpcomingInspection }) {
  return (
    <div className="flex items-start gap-3 px-5 py-4 rounded-md border-b border-gray-100 last:border-0 bg-white">
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
  )
}

export function UpcomingInspections({ inspections }: UpcomingInspectionsProps) {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.35 }}
      className="w-full h-full"
    >
      <Card className="h-full border-none shadow-sm bg-secondary-foreground">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {t('dashboard.upcomingInspections')}
            </CardTitle>
            <Calendar className="h-5 w-5 text-gray-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inspections.map((inspection) => (
              <InspectionItem key={inspection.id} inspection={inspection} />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
