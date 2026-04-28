import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileUp } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { TiptapEditor } from '@/components/common/TiptapEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'
import type { DocumentRequest } from '../documentsData'

interface UploadCustomerDocumentModalProps {
  open: boolean
  onClose: () => void
  request: DocumentRequest | null
  onSubmit: (args: { descriptionHtml: string; file: File }) => void
}

const inputClass =
  'h-11 rounded-lg border-0 bg-[#F3F4F6] shadow-none ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#00B050]/30'

const ACCEPT_ATTR = '.png,.jpg,.jpeg,.pdf,.doc,.docx'

export function UploadCustomerDocumentModal({
  open,
  onClose,
  request,
  onSubmit,
}: UploadCustomerDocumentModalProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [descriptionHtml, setDescriptionHtml] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const headerText = useMemo(() => {
    if (!request) return ''
    return t('documents.uploadHeader', { project: request.projectName })
  }, [request, t])

  useEffect(() => {
    if (!open) return
    setDescriptionHtml('')
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [open])

  if (!request) return null

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = () => {
    if (!file) {
      toast.error(t('documents.fileRequired'))
      return
    }
    if (!descriptionHtml.trim()) {
      toast.error(t('documents.descriptionRequired'))
      return
    }
    onSubmit({ descriptionHtml, file })
    toast.success(t('documents.submitted'))
    handleClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      title={t('documents.uploadTitle')}
      size="full"
      headerClassName="border-b border-gray-200 pb-4 mb-0 text-left"
      className="max-w-5xl w-[min(56rem,96vw)] gap-0 bg-white p-6 sm:rounded-xl"
    >
      <div className="space-y-6 pt-4">
        <div className="rounded-lg bg-purple-50 text-purple-700 px-4 py-2 text-sm">
          {headerText}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-800">
            {t('documents.projectName')}
          </Label>
          <Input value={request.projectName} readOnly className={cn(inputClass, 'bg-[#EEF2FF]')} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-800">
            {t('documents.reason')}
          </Label>
          <Textarea
            value={request.reason}
            readOnly
            rows={3}
            className={cn(
              'resize-none rounded-lg border-0 bg-[#F3F4F6] shadow-none ring-1 ring-inset ring-gray-100'
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-800">
            {t('documents.description')}
          </Label>
          <TiptapEditor
            content={descriptionHtml}
            onChange={setDescriptionHtml}
            placeholder={t('documents.descriptionPlaceholder')}
            className="min-h-[220px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-800">
            {t('documents.uploadDocument')}
          </Label>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null
              setFile(f)
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-full rounded-xl border border-gray-200 bg-white px-4 py-10 transition-colors',
              'hover:bg-gray-50'
            )}
          >
            <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
              <FileUp className="h-5 w-5 text-gray-500" />
              <span className="font-medium">{t('documents.uploadCta')}</span>
              <span className="text-xs text-gray-400">{t('documents.uploadTypes')}</span>
            </div>
          </button>

          {file ? (
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{t('documents.fileSelected')}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-gray-200"
                onClick={() => {
                  setFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              >
                {t('documents.removeFile')}
              </Button>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" className="border-gray-200" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white px-8"
            onClick={handleSubmit}
          >
            {t('documents.submit')}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}

