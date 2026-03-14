import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pagination } from '@/components/common/Pagination'
import { TaskCard, TaskDetailsModal } from './components'
import { myTaskMockData, type MyTask } from './myTaskData'
import { toast } from 'sonner'

export default function MyTask() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = parseInt(searchParams.get('limit') || '4', 10) || 4

  const [tasks, setTasks] = useState<MyTask[]>(myTaskMockData)
  const [selectedTask, setSelectedTask] = useState<MyTask | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [modalShowForm, setModalShowForm] = useState(false)

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
    setModalShowForm(false)
    setShowDetailsModal(true)
  }

  const handleStartOrCompleteClick = (task: MyTask) => {
    setSelectedTask(task)
    setModalShowForm(true)
    setShowDetailsModal(true)
  }

  const handleSubmitFromModal = (
    task: MyTask,
    _data: { beforePhoto?: File; afterPhoto?: File; note?: string }
  ) => {
    const isPending = task.status === 'Pending'
    const updatedTask = isPending
      ? { ...task, status: 'In Progress' as const }
      : { ...task, status: 'Completed' as const }
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? updatedTask : t))
    )
    setShowDetailsModal(false)
    setSelectedTask(null)
    toast.success(
      isPending ? t('myTask.taskStarted') : t('myTask.taskSubmitted')
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-accent">{t('myTask.allTask')}</h1>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
        {paginatedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onViewDetails={handleViewDetails}
            onStart={handleStartOrCompleteClick}
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
        showForm={modalShowForm}
        onSubmit={handleSubmitFromModal}
      />
    </div>
  )
}
