import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileText, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'
import { UploadCustomerDocumentModal } from './components/UploadCustomerDocumentModal'
import { mockDocumentRequests, type DocumentRequest } from './documentsData'

const statusStyles: Record<
  DocumentRequest['status'],
  { bg: string; text: string; labelKey: string }
> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', labelKey: 'documents.statusPending' },
  submitted: { bg: 'bg-emerald-100', text: 'text-emerald-700', labelKey: 'documents.statusSubmitted' },
}

export default function Documents() {
  const { t } = useTranslation()
  const [requests, setRequests] = useState<DocumentRequest[]>(mockDocumentRequests)
  const [selected, setSelected] = useState<DocumentRequest | null>(null)
  const [openUpload, setOpenUpload] = useState(false)

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'pending').length,
    [requests]
  )

  const handleOpen = (req: DocumentRequest) => {
    setSelected(req)
    setOpenUpload(true)
  }

  const handleSubmit = (args: { descriptionHtml: string; file: File }) => {
    if (!selected) return
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selected.id
          ? {
              ...r,
              status: 'submitted',
              submittedAt: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }),
              submittedFileName: args.file.name,
              submittedDescriptionHtml: args.descriptionHtml,
            }
          : r
      )
    )
    toast.success(t('documents.submitted'))
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
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-2 text-sm">
            <span className="text-muted-foreground">{t('documents.pendingLabel')}</span>{' '}
            <span className="font-semibold text-foreground">{pendingCount}</span>
          </div>
        </div>
      </div>

      <Card className="bg-white border shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {requests.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t('documents.empty')}
              </div>
            ) : (
              requests.map((req) => {
                const st = statusStyles[req.status]
                return (
                  <div key={req.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-5 w-5 text-gray-500 shrink-0" />
                          <h3 className="font-semibold text-gray-900 truncate">{req.projectName}</h3>
                        </div>
                        <span className={cn('rounded-full px-3 py-1 text-xs font-medium', st.bg, st.text)}>
                          {t(st.labelKey)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{req.reason}</p>
                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium text-gray-700">{t('documents.requestedBy')}:</span> {req.requestedBy}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{t('documents.requestedAt')}:</span> {req.requestedAt}
                        </div>
                        {req.submittedAt ? (
                          <div>
                            <span className="font-medium text-gray-700">{t('documents.submittedAt')}:</span> {req.submittedAt}
                          </div>
                        ) : null}
                      </div>
                      {req.submittedFileName ? (
                        <div className="mt-3 text-xs text-gray-600">
                          <span className="font-medium">{t('documents.file')}:</span> {req.submittedFileName}
                        </div>
                      ) : null}
                    </div>
                    <div className="shrink-0">
                      <Button
                        type="button"
                        className={cn(
                          'h-10 gap-2',
                          req.status === 'submitted'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        )}
                        onClick={() => handleOpen(req)}
                        disabled={req.status === 'submitted'}
                      >
                        <UploadCloud className="h-4 w-4" />
                        {req.status === 'submitted' ? t('documents.alreadySubmitted') : t('documents.upload')}
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

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

