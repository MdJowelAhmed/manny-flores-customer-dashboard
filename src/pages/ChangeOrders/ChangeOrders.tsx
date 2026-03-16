import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ViewChangeOrderDetailsModal } from './components/ViewChangeOrderDetailsModal'
import { UpdateStatusModal } from './components/UpdateStatusModal'
import {
  changeOrderStats,
  mockChangeOrders,
  type ChangeOrder,
  type ChangeOrderStatus,
} from './changeOrdersData'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { ChangeOrdersHeader } from './components/ChangeOrdersHeader'
import { ChangeOrderCard } from './components/ChangeOrderCard'
import { NewOrderModal } from './components/NewOrderModal'
import { NewChangeOrderModal } from './components/NewChangeOrderModal'
import { UploadDocumentsModal } from './components/UploadDocumentsModal'

export default function ChangeOrders() {
  const [orders, setOrders] = useState<ChangeOrder[]>(mockChangeOrders)
  const [activeTab, setActiveTab] = useState<'all' | ChangeOrderStatus>('all')
  const [selectedOrder, setSelectedOrder] = useState<ChangeOrder | null>(null)
  const [orderForStatusUpdate, setOrderForStatusUpdate] = useState<ChangeOrder | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [showNewChangeOrderModal, setShowNewChangeOrderModal] = useState(false)
  const [showUploadDocumentsModal, setShowUploadDocumentsModal] = useState(false)

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesTab = activeTab === 'all' || o.status === activeTab
      return matchesTab
    })
  }, [orders, activeTab])

  const handleStatusClick = (o: ChangeOrder) => {
    setOrderForStatusUpdate(o)
    setIsStatusModalOpen(true)
  }

  const handleStatusUpdate = (orderId: string, status: ChangeOrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    )
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status } : null))
    }
  }

  const stats = useMemo(() => {
    const total = orders.length
    const pending = orders.filter((o) => o.status === 'Pending').length
    const approved = orders.filter((o) => o.status === 'Approved').length
    const valueImpact = orders.reduce((sum, o) => sum + o.additionalCost, 0)

    return [
      { ...changeOrderStats[0], value: total },
      { ...changeOrderStats[1], value: pending },
      { ...changeOrderStats[2], value: approved },
      { ...changeOrderStats[3], value: valueImpact },
    ]
  }, [orders])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Info Banner */}
      <div className="flex gap-3 p-4 rounded-2xl  ">
       
        <div>
          <h3 className="font-semibold text-foreground">Change Order</h3>
          <p className="text-sm text-muted-foreground mt-1">
          Manage project scope changes and cost adjustments
          </p>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-sm px-5 py-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <h3 className="text-xl font-bold text-foreground mt-1">
                    {stat.title.includes('Revenue')
                      ? formatCurrency(stat.value)
                      : stat.value}
                  </h3>
                </div>
                <div className={cn('p-2.5 rounded-lg', stat.iconBg)}>
                  <Icon className={cn('h-5 w-5', stat.iconColor)} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <ChangeOrdersHeader
        
       
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewOrder={() => setShowNewOrderModal(true)}
        onOpenNewChangeOrder={() => setShowNewChangeOrderModal(true)}
      />

    

      {/* All Change Orders */}
      <div className="rounded-2xl overflow-hidden shadow-sm space-y-4">
       

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No change orders found
            </div>
          ) : (
            filteredOrders.map((o, index) => (
              <ChangeOrderCard
                key={o.id}
                order={o}
                index={index}
                onChangeStatus={() => handleStatusClick(o)}
                onUploadDocument={() => setShowUploadDocumentsModal(true)}
                onNewChangeOrder={() => setShowNewChangeOrderModal(true)}
                onApprove={
                  o.status === 'Pending'
                    ? () => handleStatusUpdate(o.id, 'Approved')
                    : undefined
                }
                onReject={
                  o.status === 'Pending'
                    ? () => handleStatusUpdate(o.id, 'Rejected')
                    : undefined
                }
              />
            ))
          )}
        </div>
      </div>

      <ViewChangeOrderDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
      />

      <UpdateStatusModal
        open={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false)
          setOrderForStatusUpdate(null)
        }}
        order={orderForStatusUpdate}
        onUpdate={handleStatusUpdate}
      />

      <NewChangeOrderModal
        open={showNewChangeOrderModal}
        onClose={() => setShowNewChangeOrderModal(false)}
        onCreate={(order) => setOrders((prev) => [order, ...prev])}
      />

      <NewOrderModal
        open={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        onCreate={(order) => setOrders((prev) => [order, ...prev])}
      />

      <UploadDocumentsModal
        open={showUploadDocumentsModal}
        onClose={() => setShowUploadDocumentsModal(false)}
      />
    </motion.div>
  )
}
