import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ProjectMaterial } from '../materialsData'

interface MaterialCardProps {
  material: ProjectMaterial
  onMarkTaken: (material: ProjectMaterial) => void
}

export function MaterialCard({ material, onMarkTaken }: MaterialCardProps) {
  const { t } = useTranslation()
  const isTaken = material.status === 'Taken'
  const statusDotColor = isTaken ? 'bg-blue-500' : 'bg-green-500'

  return (
    <Card className="rounded-xl bg-white shadow-sm overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-sm text-muted-foreground">{material.projectName}</p>
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDotColor} mt-1.5`}
            title={material.status}
          />
        </div>

        <h3 className="font-bold text-accent mb-4">{material.materialName}</h3>

        <div className="flex justify-between text-sm text-muted-foreground mb-6">
          <span>
            {t('materials.required')} <span className="font-medium text-foreground">{material.required}</span>
          </span>
          <span>
            {t('materials.delivered')} <span className="font-medium text-foreground">{material.delivered}</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 ">
          {isTaken ? (
            <span className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 h-8">
              {t('materials.taken')}
            </span>
          ) : (
            <>
                <span className="inline-flex items-center rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 h-8">
                {t('materials.delivered')}
              </span>
              <Button
                size="sm"
                className=" bg-secondary text-white hover:bg-primary/90 shrink-0 h-8"
                onClick={() => onMarkTaken(material)}
              >
                {t('materials.markTaken')}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
