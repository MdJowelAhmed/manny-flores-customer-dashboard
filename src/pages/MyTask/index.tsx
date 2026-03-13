import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pagination } from '@/components/common/Pagination'
import { TaskCard, TaskDetailsModal } from './components'
import { myTaskMockData, type MyTask } from './myTaskData'
import { toast } from 'sonner'

export default function MyTask() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = parseInt(searchParams.get('limit') || '4', 10) || 4

  const [tasks, setTasks] = useState<MyTask[]>(myTaskMockData)
  const [selectedTask, setSelectedTask] = useState<MyTask | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    p > 1 ? next.set('page', String(p)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const setLimit = (l: number) => {
    const next = new URLSearchParams(searchParams)
    l !== 4 ? next.set('limit', String(l)) : next.delete('limit')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const totalItems = tasks.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return tasks.slice(start, start + itemsPerPage)
  }, [tasks, currentPage, itemsPerPage])

  const handleViewDetails = (task: MyTask) => {
    setSelectedTask(task)
    setShowDetailsModal(true)
  }

  const handleStartOrComplete = (task: MyTask) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status:
                t.status === 'Pending'
                  ? ('In Progress' as const)
                  : t.status === 'In Progress'
                    ? ('Completed' as const)
                    : t.status,
            }
          : t
      )
    )
    if (task.status === 'Pending') {
      toast.success('Task started successfully')
    } else if (task.status === 'In Progress') {
      toast.success('Task completed successfully')
    }
  }

  const handleStartFromModal = (task: MyTask) => {
    handleStartOrComplete(task)
  }

  const handleSubmitFromModal = (
    task: MyTask,
    _data: { beforePhoto?: File; afterPhoto?: File; note?: string }
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: 'Completed' as const } : t
      )
    )
    toast.success('Task submitted successfully')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-accent">All Task</h1>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
        {paginatedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onViewDetails={handleViewDetails}
            onStartOrComplete={handleStartOrComplete}
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

      <TaskDetailsModal
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
        onStart={handleStartFromModal}
        onSubmit={handleSubmitFromModal}
      />
    </div>
  )
}
