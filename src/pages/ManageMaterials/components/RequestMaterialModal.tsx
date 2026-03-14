import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormSelect, FormTextarea } from '@/components/common'
import { Button } from '@/components/ui/button'
import {
  MATERIAL_OPTIONS,
  URGENCY_OPTIONS,
  PROJECT_OPTIONS,
  TASK_OPTIONS,
} from '../materialsData'

const requestMaterialSchema = z.object({
  materialName: z.string().min(1, 'Please select a material'),
  quantityNeeded: z.string().min(1, 'Quantity is required'),
  urgencyLevel: z.string().min(1, 'Please select urgency level'),
  projectName: z.string().min(1, 'Please select a project'),
  taskName: z.string().min(1, 'Please select a task'),
  reason: z.string().optional(),
})

export type RequestMaterialFormData = z.infer<typeof requestMaterialSchema>

interface RequestMaterialModalProps {
  open: boolean
  onClose: () => void
  onRequest: (data: RequestMaterialFormData) => void
}

export function RequestMaterialModal({
  open,
  onClose,
  onRequest,
}: RequestMaterialModalProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RequestMaterialFormData>({
    resolver: zodResolver(requestMaterialSchema),
    defaultValues: {
      materialName: '',
      quantityNeeded: '',
      urgencyLevel: '',
      projectName: '',
      taskName: '',
      reason: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        materialName: '',
        quantityNeeded: '',
        urgencyLevel: '',
        projectName: '',
        taskName: '',
        reason: '',
      })
    }
  }, [open, reset])

  const onSubmit = (data: RequestMaterialFormData) => {
    onRequest(data)
    reset()
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('materials.requestMaterial')}
      size="lg"
      className="max-w-3xl bg-white"
      footer={
        <Button
          type="submit"
          form="request-material-form"
          className="w-full bg-primary text-white rounded-md"
          disabled={isSubmitting}
        >
          {t('materials.request')}
        </Button>
      }
    >
      <form
        id="request-material-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="materialName"
            control={control}
            render={({ field }) => (
              <FormSelect
                label={t('materials.materialName')}
                value={field.value}
                options={MATERIAL_OPTIONS}
                onChange={field.onChange}
                placeholder={t('materials.selectMaterial')}
                error={errors.materialName?.message}
                required
              />
            )}

          />
          <FormInput
            label={t('materials.quantityNeeded')}
            placeholder={t('materials.enterQuantity')}
            {...register('quantityNeeded')}
            error={errors.quantityNeeded?.message}
            required
          />
          <Controller
            name="urgencyLevel"
            control={control}
            render={({ field }) => (
              <FormSelect
                label={t('materials.urgencyLevel')}
                value={field.value}
                options={URGENCY_OPTIONS}
                onChange={field.onChange}
                placeholder={t('materials.selectUrgency')}
                error={errors.urgencyLevel?.message}
                required
              />
            )}
          />
          <Controller
            name="projectName"
            control={control}
            render={({ field }) => (
              <FormSelect
                label={t('materials.projectName')}
                value={field.value}
                options={PROJECT_OPTIONS}
                onChange={field.onChange}
                placeholder={t('materials.selectProject')}
                error={errors.projectName?.message}
                required
              />
            )}
          />
        </div>
        <Controller
          name="taskName"
          control={control}
          render={({ field }) => (
            <FormSelect
              label={t('materials.taskName')}
              value={field.value}
              options={TASK_OPTIONS}
              onChange={field.onChange}
              placeholder={t('materials.selectTask')}
              error={errors.taskName?.message}
              required
            />
          )}
        />
        <FormTextarea
          label={t('materials.reason')}
          placeholder={t('materials.writeReason')}
          {...register('reason')}
          error={errors.reason?.message}
          className="min-h-[80px] resize-none"
        />
      </form>
    </ModalWrapper>
  )
}
