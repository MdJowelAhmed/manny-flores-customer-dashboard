import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormTextarea } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'

const addProjectSchema = z
  .object({
    projectName: z.string().min(1, 'Project name is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    description: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })

export type AddProjectFormData = z.infer<typeof addProjectSchema>

interface AddProjectModalProps {
  open: boolean
  onClose: () => void
  onRequest: (data: AddProjectFormData) => void
}

const inputSurface = 'bg-gray-50 border-gray-200 placeholder:text-gray-400'

export function AddProjectModal({ open, onClose, onRequest }: AddProjectModalProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddProjectFormData>({
    resolver: zodResolver(addProjectSchema),
    defaultValues: {
      projectName: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        projectName: '',
        startDate: '',
        endDate: '',
        description: '',
      })
    }
  }, [open, reset])

  const onSubmit = (data: AddProjectFormData) => {
    onRequest(data)
    reset()
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('projects.addProjectTitle')}
      size="lg"
      className="max-w-2xl bg-white sm:rounded-2xl"
      headerClassName="pb-2"
      footer={
        <div className="flex justify-end gap-3">
     
          <Button
            type="submit"
            form="add-project-form"
            className="min-w-[100px] rounded-md bg-primary text-white hover:bg-[#52c46d]"
            disabled={isSubmitting}
          >
            {t('projects.request')}
          </Button>
        </div>
      }
    >
      <form id="add-project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label={t('projects.projectName')}
          placeholder={t('projects.enterProjectName')}
          className={inputSurface}
          error={errors.projectName?.message}
          {...register('projectName')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="add-project-start">{t('projects.startDate')}</Label>
            <div className="relative">
              <Input
                id="add-project-start"
                type="date"
                className={cn('h-11', inputSurface)}
                error={!!errors.startDate}
                {...register('startDate')}
              />
            </div>
            {errors.startDate && (
              <p className="text-xs text-destructive">{errors.startDate.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-project-end">{t('projects.endDate')}</Label>
            <div className="relative">
              <Input
                id="add-project-end"
                type="date"
                className={cn('h-11', inputSurface)}
                error={!!errors.endDate}
                {...register('endDate')}
              />
            </div>
            {errors.endDate && (
              <p className="text-xs text-destructive">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <FormTextarea
          label={t('projects.projectDescription')}
          placeholder={t('projects.descriptionPlaceholder')}
          rows={5}
          className={cn('min-h-[120px] resize-y', inputSurface)}
          error={errors.description?.message}
          {...register('description')}
        />
      </form>
    </ModalWrapper>
  )
}
