import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ViewChangeOrderDetailsModal } from './components/ViewChangeOrderDetailsModal'
import { UpdateStatusModal } from './components/UpdateStatusModal'
import {
  changeOrderStats,
  type ChangeOrderStatus,
} from './changeOrdersData'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { ChangeOrdersHeader } from './components/ChangeOrdersHeader'
import { ChangeOrderCard } from './components/ChangeOrderCard'
import { NewOrderModal } from './components/NewOrderModal'
import { NewChangeOrderModal } from './components/NewChangeOrderModal'
import { UploadDocumentsModal } from './components/UploadDocumentsModal'
import { useChangeOrderStatusMutation, useGetChangeOrdersQuery } from '@/redux/slices/customer/changeOrdersApi'
import Spinner from '@/components/common/Spinner'
import { Pagination } from '@/components/common/Pagination'
import { sonnerToast } from '@/utils/toast'

export default function ChangeOrders() {
  const [activeTab, setActiveTab] = useState<'all' | ChangeOrderStatus>('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [orderForStatusUpdate, setOrderForStatusUpdate] = useState<any | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [showNewChangeOrderModal, setShowNewChangeOrderModal] = useState(false)
  const [showUploadDocumentsModal, setShowUploadDocumentsModal] = useState(false)



  // API CALLS
  const { data: changeOrdersData, isLoading: changeOrdersLoading, refetch } = useGetChangeOrdersQuery({
    page,
    limit,
    status: activeTab === 'all' ? undefined : activeTab.toUpperCase()
  });
  const [changeOrderStatusMutation] = useChangeOrderStatusMutation();

  const apiOrders = changeOrdersData?.data || [];
  const pagination = changeOrdersData?.pagination;

  const filteredOrders = apiOrders;

  const handleStatusClick = (o: any) => {
    setOrderForStatusUpdate(o)
    setIsStatusModalOpen(true)
  }

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      sonnerToast.promise(changeOrderStatusMutation({ id: orderId, status: status.toUpperCase() }).unwrap(), {
        loading: 'Updating status...',
        success: (res) => {
          refetch();
          return res?.message || 'Status updated successfully'
        },
        error: (error) => {
          return error?.message || 'Failed to update status'
        },
      })
    } catch (e) {
      console.error(e)
    }
  }

  const stats = useMemo(() => {
    const total = apiOrders.length
    const pending = apiOrders.filter((o: any) => o.status === 'PENDING').length
    const approved = apiOrders.filter((o: any) => o.status === 'APPROVED').length
    const valueImpact = apiOrders.reduce((sum: number, o: any) => sum + o.additionalCost, 0)

    return [
      { ...changeOrderStats[0], value: total },
      { ...changeOrderStats[1], value: pending },
      { ...changeOrderStats[2], value: approved },
      { ...changeOrderStats[3], value: valueImpact },
    ]
  }, [apiOrders])

  if (changeOrdersLoading) {
    return <Spinner />
  }

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
        {stats?.map((stat, index) => {
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
            filteredOrders?.map((o: any, index: number) => (
              <ChangeOrderCard
                key={o.id}
                order={o}
                index={index}
                onChangeStatus={() => handleStatusClick(o)}
                onUploadDocument={() => setShowUploadDocumentsModal(true)}
                onNewChangeOrder={() => setShowNewChangeOrderModal(true)}
                onApprove={
                  o.status === 'PENDING'
                    ? () => handleStatusUpdate(o.id, 'APPROVED')
                    : undefined
                }
                onReject={
                  o.status === 'PENDING'
                    ? () => handleStatusUpdate(o.id, 'REJECTED')
                    : undefined
                }
              />
            ))
          )}
        </div>
        {pagination && (
          <div className="border-t border-gray-100 bg-white px-6">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPage}
              totalItems={pagination.total}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
            />
          </div>
        )}
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
        onCreate={() => refetch()}
      />

      <NewOrderModal
        open={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        onCreate={() => refetch()}
      />

      <UploadDocumentsModal
        open={showUploadDocumentsModal}
        onClose={() => setShowUploadDocumentsModal(false)}
      />
    </motion.div>
  )
}
