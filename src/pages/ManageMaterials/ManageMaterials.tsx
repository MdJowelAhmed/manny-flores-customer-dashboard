import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/Pagination'
import { MaterialCard } from './components/MaterialCard'
import { RequestMaterialModal } from './components/RequestMaterialModal'
import {
  mockProjectMaterialsData,
  getMaterialLabel,
  PROJECT_OPTIONS,
  type ProjectMaterial,
} from './materialsData'
import type { RequestMaterialFormData } from './components/RequestMaterialModal'
import { toast } from '@/utils/toast'

export default function ManageMaterials() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = parseInt(searchParams.get('limit') || '9', 10) || 9

  const [materials, setMaterials] = useState<ProjectMaterial[]>(mockProjectMaterialsData)
  const [showRequestModal, setShowRequestModal] = useState(false)

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    p > 1 ? next.set('page', String(p)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const setLimit = (l: number) => {
    const next = new URLSearchParams(searchParams)
    l !== 9 ? next.set('limit', String(l)) : next.delete('limit')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const totalItems = materials.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return materials.slice(start, start + itemsPerPage)
  }, [materials, currentPage, itemsPerPage])

  const handleMarkTaken = (material: ProjectMaterial) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === material.id ? { ...m, status: 'Taken' as const } : m
      )
    )
    toast({ title: t('materials.markedAsTaken'), variant: 'success' })
  }

  const handleRequestMaterial = (data: RequestMaterialFormData) => {
    const projectLabel = PROJECT_OPTIONS.find((o) => o.value === data.projectName)?.label ?? 'Green Villa Project'
    const newMaterial: ProjectMaterial = {
      id: `pm-${Date.now()}`,
      projectName: projectLabel,
      materialName: getMaterialLabel(data.materialName),
      required: `${data.quantityNeeded} Unit`,
      delivered: '0 Unit',
      status: 'Delivered',
    }
    setMaterials((prev) => [newMaterial, ...prev])
    toast({
      title: t('materials.requestSubmitted'),
      variant: 'success',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold text-accent">
          {t('materials.trackProjectMaterials')}
        </h1>
        <Button
          onClick={() => setShowRequestModal(true)}
          className="bg-primary text-white  shrink-0"
        >
          {t('materials.requestMaterial')}
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedMaterials.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            onMarkTaken={handleMarkTaken}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setPage}
        onItemsPerPageChange={setLimit}
        showItemsPerPage
      />

      <RequestMaterialModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onRequest={handleRequestMaterial}
      />
    </div>
  )
}
