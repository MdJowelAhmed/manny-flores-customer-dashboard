import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/Pagination'
import { EquipmentCard } from './components/EquipmentCard'
import { ReportIssueModal } from './components/ReportIssueModal'
import { RequestEquipmentModal } from './components/RequestEquipmentModal'
import {
  mockEquipmentData,
  EQUIPMENT_NAME_OPTIONS,
  PROJECT_OPTIONS,
  type EquipmentCardData,
} from './equipmentData'
import type { ReportIssueFormData } from './components/ReportIssueModal'
import type { RequestEquipmentFormData } from './components/RequestEquipmentModal'
import { toast } from '@/utils/toast'

export default function Equipment() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = parseInt(searchParams.get('limit') || '9', 10) || 9

  const [equipment, setEquipment] = useState<EquipmentCardData[]>(mockEquipmentData)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentCardData | null>(null)

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

  const totalItems = equipment.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedEquipment = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return equipment.slice(start, start + itemsPerPage)
  }, [equipment, currentPage, itemsPerPage])

  const handleReportIssue = (item: EquipmentCardData) => {
    setSelectedEquipment(item)
    setShowReportModal(true)
  }

  const handleReportSubmit = (
    _data: ReportIssueFormData,
    _photo?: File | null
  ) => {
    toast({
      title: t('equipment.issueReported'),
      description: t('equipment.issueReportedDescription', { type: selectedEquipment?.equipmentType, plate: selectedEquipment?.plate }),
      variant: 'success',
    })
    setShowReportModal(false)
    setSelectedEquipment(null)
  }

  const handleRequestEquipment = (data: RequestEquipmentFormData) => {
    const projectLabel =
      PROJECT_OPTIONS.find((o) => o.value === data.projectName)?.label ??
      'Green Villa Project'
    const equipmentLabel =
      EQUIPMENT_NAME_OPTIONS.find((o) => o.value === data.equipmentName)
        ?.label ?? data.equipmentName

    const newEquipment: EquipmentCardData = {
      id: `eq-${Date.now()}`,
      projectName: projectLabel,
      status: 'Active',
      equipmentType: equipmentLabel,
      plate: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      mileage: '0 miles',
      lastService: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      nextService: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000
      ).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }
    setEquipment((prev) => [newEquipment, ...prev])
    toast({
      title: t('equipment.requestSubmitted'),
      description: t('equipment.requestDescription'),
      variant: 'success',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold text-accent">
          {t('equipment.assignedEquipment')}
        </h1>
        <Button
          onClick={() => setShowRequestModal(true)}
          className="bg-primary text-white shrink-0 hover:bg-primary/90"
        >
          {t('equipment.requestEquipment')}
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedEquipment.map((item) => (
          <EquipmentCard
            key={item.id}
            equipment={item}
            onReportIssue={handleReportIssue}
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

      <ReportIssueModal
        open={showReportModal}
        onClose={() => {
          setShowReportModal(false)
          setSelectedEquipment(null)
        }}
        equipment={selectedEquipment}
        onSubmit={handleReportSubmit}
      />

      <RequestEquipmentModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onRequest={handleRequestEquipment}
      />
    </motion.div>
  )
}
