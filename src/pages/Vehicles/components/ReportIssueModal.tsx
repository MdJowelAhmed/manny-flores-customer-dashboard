import { useEffect, useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera } from 'lucide-react'
import { ModalWrapper, FormSelect, FormTextarea } from '@/components/common'
import { Button } from '@/components/ui/button'
import { ISSUE_TYPE_OPTIONS, URGENCY_OPTIONS } from '../vehiclesData'
import type { VehicleCardData } from '../vehiclesData'
const reportIssueSchema = z.object({
  issueType: z.string().min(1, 'Please select issue type'),
  urgencyLevel: z.string().min(1, 'Please select urgency level'),
  description: z.string().min(1, 'Description is required'),
})

export type ReportIssueFormData = z.infer<typeof reportIssueSchema>

interface ReportIssueModalProps {
  open: boolean
  onClose: () => void
  vehicle: VehicleCardData | null
  onSubmit: (data: ReportIssueFormData, photo?: File | null) => void
}

export function ReportIssueModal({
  open,
  onClose,
  vehicle: _vehicle,
  onSubmit,
}: ReportIssueModalProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReportIssueFormData>({
    resolver: zodResolver(reportIssueSchema),
    defaultValues: {
      issueType: '',
      urgencyLevel: '',
      description: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({ issueType: '', urgencyLevel: '', description: '' })
      setPhotoFile(null)
    }
  }, [open, reset])

  const handleFormSubmit = (data: ReportIssueFormData) => {
    onSubmit(data, photoFile)
    reset()
    setPhotoFile(null)
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('vehicles.reportIssue')}
      size="lg"
      className="max-w-lg bg-white"
      footer={
        <Button
          type="submit"
          form="report-issue-form"
          className="w-full bg-primary text-white rounded-lg hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {t('vehicles.submit')}
        </Button>
      }
    >
      <form
        id="report-issue-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <Controller
          name="issueType"
          control={control}
          render={({ field }) => (
            <FormSelect
              label={t('vehicles.issueType')}
              value={field.value}
              options={ISSUE_TYPE_OPTIONS}
              onChange={field.onChange}
              placeholder={t('vehicles.selectIssueType')}
              error={errors.issueType?.message}
              required
            />
          )}
        />
        <Controller
          name="urgencyLevel"
          control={control}
          render={({ field }) => (
            <FormSelect
              label={t('vehicles.urgencyLevel')}
              value={field.value}
              options={URGENCY_OPTIONS}
              onChange={field.onChange}
              placeholder={t('vehicles.selectUrgency')}
              error={errors.urgencyLevel?.message}
              required
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <FormTextarea
              label={t('vehicles.description')}
              placeholder={t('vehicles.writeReason')}
              {...field}
              error={errors.description?.message}
              className="min-h-[80px] resize-none bg-gray-50"
              required
            />
          )}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('vehicles.uploadPhoto')}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-4 w-4 mr-2" />
            {t('vehicles.addPhoto')}
            {photoFile && (
              <span className="ml-2 text-muted-foreground text-xs">
                ({photoFile.name})
              </span>
            )}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
