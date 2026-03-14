import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/Pagination'
import { VehicleCard } from './components/VehicleCard'
import { ReportIssueModal } from './components/ReportIssueModal'
import { RequestVehicleModal } from './components/RequestVehicleModal'
import {
  mockVehiclesData,
  PROJECT_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  type VehicleCardData,
} from './vehiclesData'
import type { ReportIssueFormData } from './components/ReportIssueModal'
import type { RequestVehicleFormData } from './components/RequestVehicleModal'
import { toast } from '@/utils/toast'

export default function Vehicles() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = parseInt(searchParams.get('limit') || '9', 10) || 9

  const [vehicles, setVehicles] = useState<VehicleCardData[]>(mockVehiclesData)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCardData | null>(
    null
  )

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

  const totalItems = vehicles.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return vehicles.slice(start, start + itemsPerPage)
  }, [vehicles, currentPage, itemsPerPage])

  const handleReportIssue = (vehicle: VehicleCardData) => {
    setSelectedVehicle(vehicle)
    setShowReportModal(true)
  }

  const handleReportSubmit = (
    _data: ReportIssueFormData,
    _photo?: File | null
  ) => {
    toast({
      title: t('vehicles.issueReported'),
      description: t('vehicles.issueReportedDescription', { type: selectedVehicle?.vehicleType, plate: selectedVehicle?.plate }),
      variant: 'success',
    })
    setShowReportModal(false)
    setSelectedVehicle(null)
  }

  const handleRequestVehicle = (data: RequestVehicleFormData) => {
    const projectLabel =
      PROJECT_OPTIONS.find((o) => o.value === data.projectName)?.label ??
      'Green Villa Project'
    const vehicleLabel =
      VEHICLE_TYPE_OPTIONS.find((o) => o.value === data.vehicleType)?.label ??
      data.vehicleType

    const newVehicle: VehicleCardData = {
      id: `v-${Date.now()}`,
      projectName: projectLabel,
      status: 'Active',
      vehicleType: vehicleLabel,
      plate: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      mileage: '0 miles',
      lastService: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      nextService: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(
        'en-US',
        { month: 'short', day: 'numeric', year: 'numeric' }
      ),
    }
    setVehicles((prev) => [newVehicle, ...prev])
    toast({
      title: t('vehicles.vehicleRequestSubmitted'),
      description: t('vehicles.vehicleRequestDescription'),
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
        <h1 className="text-xl font-semibold text-accent">{t('vehicles.title')}</h1>
        <Button
          onClick={() => setShowRequestModal(true)}
          className="bg-primary text-white shrink-0 hover:bg-primary/90"
        >
          {t('vehicles.requestVehicle')}
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
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
          setSelectedVehicle(null)
        }}
        vehicle={selectedVehicle}
        onSubmit={handleReportSubmit}
      />

      <RequestVehicleModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onRequest={handleRequestVehicle}
      />
    </motion.div>
  )
}
