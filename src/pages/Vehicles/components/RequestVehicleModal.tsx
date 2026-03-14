import { useEffect, useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera } from 'lucide-react'
import { ModalWrapper, FormSelect, FormTextarea } from '@/components/common'
import { Button } from '@/components/ui/button'
import {
  VEHICLE_TYPE_OPTIONS,
  PROJECT_OPTIONS,
  URGENCY_OPTIONS,
} from '../vehiclesData'

const requestVehicleSchema = z.object({
  vehicleType: z.string().min(1, 'Please select vehicle type'),
  projectName: z.string().min(1, 'Please select project name'),
  urgencyLevel: z.string().min(1, 'Please select urgency level'),
  reason: z.string().min(1, 'Reason is required'),
})

export type RequestVehicleFormData = z.infer<typeof requestVehicleSchema>

interface RequestVehicleModalProps {
  open: boolean
  onClose: () => void
  onRequest: (data: RequestVehicleFormData, photo?: File | null) => void
}

export function RequestVehicleModal({
  open,
  onClose,
  onRequest,
}: RequestVehicleModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RequestVehicleFormData>({
    resolver: zodResolver(requestVehicleSchema),
    defaultValues: {
      vehicleType: '',
      projectName: '',
      urgencyLevel: '',
      reason: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        vehicleType: '',
        projectName: '',
        urgencyLevel: '',
        reason: '',
      })
      setPhotoFile(null)
    }
  }, [open, reset])

  const handleFormSubmit = (data: RequestVehicleFormData) => {
    onRequest(data, photoFile)
    reset()
    setPhotoFile(null)
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Request Vehicle"
      size="lg"
      className="max-w-xl bg-white"
      footer={
        <Button
          type="submit"
          form="request-vehicle-form"
          className="w-full bg-primary text-white rounded-lg hover:bg-primary/90"
          disabled={isSubmitting}
        >
          Request
        </Button>
      }
    >
      <form
        id="request-vehicle-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <Controller
          name="vehicleType"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Vehicle type"
              value={field.value}
              options={VEHICLE_TYPE_OPTIONS}
              onChange={field.onChange}
              placeholder="Select vehicle type"
              error={errors.vehicleType?.message}
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
              placeholder="Write the reason..."
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
