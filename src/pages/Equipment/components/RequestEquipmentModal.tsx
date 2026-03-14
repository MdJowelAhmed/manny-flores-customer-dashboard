import { useEffect, useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera } from 'lucide-react'
import { ModalWrapper, FormSelect, FormTextarea } from '@/components/common'
import { Button } from '@/components/ui/button'
import {
  EQUIPMENT_NAME_OPTIONS,
  EQUIPMENT_TYPE_OPTIONS,
  PROJECT_OPTIONS,
  URGENCY_OPTIONS,
} from '../equipmentData'

const requestEquipmentSchema = z.object({
  equipmentName: z.string().min(1, 'Please select equipment name'),
  equipmentType: z.string().min(1, 'Please select equipment type'),
  projectName: z.string().min(1, 'Please select project name'),
  urgencyLevel: z.string().min(1, 'Please select urgency level'),
  reason: z.string().min(1, 'Reason is required'),
})

export type RequestEquipmentFormData = z.infer<typeof requestEquipmentSchema>

interface RequestEquipmentModalProps {
  open: boolean
  onClose: () => void
  onRequest: (data: RequestEquipmentFormData, photo?: File | null) => void
}

export function RequestEquipmentModal({
  open,
  onClose,
  onRequest,
}: RequestEquipmentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RequestEquipmentFormData>({
    resolver: zodResolver(requestEquipmentSchema),
    defaultValues: {
      equipmentName: '',
      equipmentType: '',
      projectName: '',
      urgencyLevel: '',
      reason: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        equipmentName: '',
        equipmentType: '',
        projectName: '',
        urgencyLevel: '',
        reason: '',
      })
      setPhotoFile(null)
    }
  }, [open, reset])

  const handleFormSubmit = (data: RequestEquipmentFormData) => {
    onRequest(data, photoFile)
    reset()
    setPhotoFile(null)
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Request equipment"
      size="lg"
      className="max-w-xl bg-white"
      footer={
        <Button
          type="submit"
          form="request-equipment-form"
          className="w-full bg-primary text-white rounded-lg hover:bg-primary/90"
          disabled={isSubmitting}
        >
          Request
        </Button>
      }
    >
      <form
        id="request-equipment-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <Controller
          name="equipmentName"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Equipment Name"
              value={field.value}
              options={EQUIPMENT_NAME_OPTIONS}
              onChange={field.onChange}
              placeholder="Select Equipment name"
              error={errors.equipmentName?.message}
              required
            />
          )}
        />
        <Controller
          name="equipmentType"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Equipment Type"
              value={field.value}
              options={EQUIPMENT_TYPE_OPTIONS}
              onChange={field.onChange}
              placeholder="Select Equipment type"
              error={errors.equipmentType?.message}
              required
            />
          )}
        />
        <Controller
          name="projectName"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Project name"
              value={field.value}
              options={PROJECT_OPTIONS}
              onChange={field.onChange}
              placeholder="Select project name"
              error={errors.projectName?.message}
              required
            />
          )}
        />
        <Controller
          name="urgencyLevel"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Urgency Level"
              value={field.value}
              options={URGENCY_OPTIONS}
              onChange={field.onChange}
              placeholder="Select urgency level"
              error={errors.urgencyLevel?.message}
              required
            />
          )}
        />
        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <FormTextarea
              label="Reason"
              placeholder="Write the reason.."
              {...field}
              error={errors.reason?.message}
              className="min-h-[80px] resize-none bg-gray-50"
              required
            />
          )}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploads Photo (optional)</p>
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
            Add Photo
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
