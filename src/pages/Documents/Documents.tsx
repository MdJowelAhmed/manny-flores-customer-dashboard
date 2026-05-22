import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileText, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'
import { UploadCustomerDocumentModal } from './components/UploadCustomerDocumentModal'
import { useGetDocumentsQuery, useSubmitDocumentMutation } from '@/redux/slices/customer/documentsApi'
import { Input } from '@/components/ui/input'
import { sonnerToast } from '@/utils/toast'
const statusStyles: Record<
  string,
  { bg: string; text: string; labelKey: string }
> = {
  PENDING: { bg: 'bg-amber-100', text: 'text-gray-900', labelKey: 'documents.statusPending' },
  APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', labelKey: 'documents.statusSubmitted' },
  COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-700', labelKey: 'documents.statusSubmitted' },
}

export default function Documents() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<any | null>(null)
  const [openUpload, setOpenUpload] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  // API CALLS
  const { data: response, isLoading, refetch } = useGetDocumentsQuery({ page, search })
  const documentsApi = response?.data || []
  const pagination = response?.pagination

  const [submitDocument] = useSubmitDocumentMutation()

  const pendingCount = useMemo(
    () => documentsApi.filter((r: any) => r.status === 'PENDING').length,
    [documentsApi]
  )

  const handleOpen = (req: any) => {
    setSelected(req)
    setOpenUpload(true)
  }

  const handleSubmit = async (args: { documentType: string; file: File }) => {
    if (!selected) return
    const formData = new FormData()
    formData.append('projectName', selected.project?.estimates?.projectName || 'Project')
    formData.append('documentUrl', args.file)
    formData.append('documentType', args.documentType)
    formData.append('status', 'APPROVED')

    try {
      sonnerToast.promise(submitDocument({ id: selected.id, data: formData }).unwrap(), {
        loading: t('documents.loading'),
        success: (res: any) => {
          refetch()
          setOpenUpload(false)
          setSelected(null)

          return res?.message || t('documents.submitted')
        },
        error: t('documents.error'),
      })
    } catch (err) {
      toast.error('Failed to submit document')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('documents.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('documents.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 ">
          <Input
            placeholder={t('documents.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-9'
          />

          <div className="rounded-xl border border-gray-100 bg-white px-4 py-2 text-sm w-fit text-nowrap">
            <span className="text-muted-foreground ">{t('documents.pendingLabel')}</span>{' '}
            <span className="font-semibold text-foreground">{pendingCount}</span>
          </div>
        </div>
      </div>

      <Card className="bg-white border shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
            ) : documentsApi.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t('documents.empty')}
              </div>
            ) : (
              documentsApi.map((req: any) => {
                const st = statusStyles[req.status] || { bg: 'bg-gray-100', text: 'text-gray-900', labelKey: req.status }
                return (
                  <div key={req.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-5 w-5 text-gray-500 shrink-0" />
                          <h3 className="font-semibold text-gray-900 truncate">{req.project?.estimates?.projectName || 'Project'}</h3>
                        </div>
                        <span className={cn('rounded-full px-3 py-1 text-xs font-medium', st.bg, st.text)}>
                          {st.labelKey.includes('.') ? t(st.labelKey) : st.labelKey}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{req.description}</p>
                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium text-gray-700">{t('documents.requestedAt')}:</span> {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Button
                        type="button"
                        className={cn(
                          'h-10 gap-2',
                          req.status !== 'PENDING'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        )}
                        onClick={() => handleOpen(req)}
                        disabled={req.status !== 'PENDING'}
                      >
                        <UploadCloud className="h-4 w-4" />
                        {req.status !== 'PENDING' ? t('documents.alreadySubmitted') : t('documents.upload')}
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {pagination && pagination.totalPage > 1 && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-gray-600 px-2">
            Page {page} of {pagination.totalPage}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(pagination.totalPage, p + 1))}
            disabled={page === pagination.totalPage}
          >
            Next
          </Button>
        </div>
      )}

      <UploadCustomerDocumentModal
        open={openUpload}
        onClose={() => {
          setOpenUpload(false)
          setSelected(null)
        }}
        request={selected}
        onSubmit={handleSubmit}
      />
    </motion.div>
  )
}

