import { Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  VEHICLE_STATUS_CONFIG,
  type VehicleCardData,
} from '../vehiclesData'

interface VehicleCardProps {
  vehicle: VehicleCardData
  onReportIssue: (vehicle: VehicleCardData) => void
}

export function VehicleCard({ vehicle, onReportIssue }: VehicleCardProps) {
  const { t } = useTranslation()
  const statusConfig = VEHICLE_STATUS_CONFIG[vehicle.status]

  return (
    <Card className="rounded-xl bg-white shadow-sm overflow-hidden border border-gray-100">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-sm text-muted-foreground">{vehicle.projectName}</p>
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusConfig.dotColor} mt-1.5`}
            title={vehicle.status}
          />
        </div>

        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-bold text-accent pt-1">{vehicle.vehicleType}</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {t('vehicles.plate')}: {vehicle.plate} • {vehicle.mileage}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t('vehicles.lastService')}</p>
            <p className="font-medium text-foreground">{vehicle.lastService}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('vehicles.nextService')}</p>
            <p className="font-medium text-foreground">{vehicle.nextService}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig.badgeClass}`}
          >
            {vehicle.status}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="border-secondary text-secondary hover:bg-secondary/60 shrink-0 h-8 rounded-full"
            onClick={() => onReportIssue(vehicle)}
          >
            {t('vehicles.reportIssue')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
