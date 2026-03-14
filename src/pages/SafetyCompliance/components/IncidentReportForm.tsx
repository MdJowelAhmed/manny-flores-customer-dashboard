import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormInput, FormSelect, FormTextarea } from '@/components/common/Form'
import { INCIDENT_TYPE_OPTIONS } from '../safetyComplianceData'
import { format } from 'date-fns'
import { toast } from '@/utils/toast'

const incidentReportSchema = z.object({
  dateTime: z.string(),
  location: z.string().min(1, 'Location is required'),
  involvedPerson: z.string().min(1, 'Involved person name is required'),
  witnessName: z.string().optional(),
  incidentType: z.string().min(1, 'Please select an incident type'),
  description: z.string().min(1, 'Description is required'),
})

type IncidentReportFormData = z.infer<typeof incidentReportSchema>

const inputBaseClass =
  'flex h-11 w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-[#333333] placeholder:text-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#28a745]/20 focus:border-[#28a745] disabled:cursor-not-allowed disabled:opacity-50 transition-colors'

export function IncidentReportForm() {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<IncidentReportFormData>({
    resolver: zodResolver(incidentReportSchema),
    defaultValues: {
      dateTime: format(new Date(), 'MMM d, yyyy - HH : mm a'),
      location: '',
      involvedPerson: '',
      witnessName: '',
      incidentType: '',
      description: '',
    },
  })

  const incidentType = watch('incidentType')

  const onSubmit = async (_data: IncidentReportFormData) => {
    setIsSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      toast({
        variant: 'success',
        title: t('safety.incidentReportSubmitted'),
        description: t('safety.incidentReportSubmittedDesc'),
      })
      reset({
        dateTime: format(new Date(), 'MMM d, yyyy - HH : mm a'),
        location: '',
        involvedPerson: '',
        witnessName: '',
        incidentType: '',
        description: '',
      })
    } catch {
      toast({ title: t('safety.submissionFailed'), variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[400px] bg-[#F8F8F8] -m-6 lg:-m-8 p-6 lg:p-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" mx-auto space-y-6"
      >
        <div className="rounded-xl bg-white p-6 shadow-sm space-y-6">
          {/* Logistics */}
          <div>
            <h3 className="text-base font-bold text-[#333333] mb-4">
              {t('safety.logistics')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#333333] block">
                  {t('safety.dateTime')}
                </label>
                <input
                  {...register('dateTime')}
                  readOnly
                  className={`${inputBaseClass}  text-[#666666] cursor-default`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#333333] block">
                  {t('safety.locationLabel')}
                </label>
                <div className="relative">
                  <input
                    {...register('location')}
                    placeholder={t('safety.enterLocation')}
                    className={`${inputBaseClass} pr-9`}
                  />
                  <ChevronRight
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#CCCCCC]"
                    strokeWidth={2}
                  />
                </div>
                {errors.location && (
                  <p className="text-xs text-destructive">{errors.location.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* People Involved */}
          <div>
            <h3 className="text-base font-bold text-[#333333] mb-4">
              {t('safety.peopleInvolved')}
            </h3>
            <div className=" grid grid-cols-1 md:grid-cols-2 gap-10">
              <FormInput
                label={t('safety.involvedPerson')}
                placeholder={t('safety.fullName')}
                error={errors.involvedPerson?.message}
                {...register('involvedPerson')}
                className={inputBaseClass}
              />
              <FormInput
                label={t('safety.witnessName')}
                placeholder={t('safety.fullNameOptional')}
                error={errors.witnessName?.message}
                {...register('witnessName')}
                className={inputBaseClass}
              />
            </div>
          </div>

          {/* Incident Details */}
          <div>
            <h3 className="text-base font-bold text-[#333333] mb-4">
              {t('safety.incidentDetails')}
            </h3>
            <div className="space-y-4">
              <FormSelect
                label={t('safety.incidentType')}
                value={incidentType}
                onChange={(v) => setValue('incidentType', v)}
                options={INCIDENT_TYPE_OPTIONS}
                placeholder={t('common.select')}
                error={errors.incidentType?.message}
                triggerClassName="h-11 rounded-lg border-[#E0E0E0]"
              />
              <FormTextarea
                label={t('safety.description')}
                placeholder={t('safety.describeWhatHappened')}
                error={errors.description?.message}
                {...register('description')}
                className="flex w-full min-h-[140px] rounded-lg border border-[#E0E0E0] bg-white px-3 py-3 text-sm text-[#333333] placeholder:text-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#28a745]/20 focus:border-[#28a745] resize-none"
                rows={5}
              />
            </div>
          </div>
        </div>

       <div className="flex justify-end">
       <Button
          type="submit"
          className="w-1/4 bg-primary text-white font-semibold rounded-lg h-12 text-base shadow-sm "
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {t('safety.submit')}
        </Button>
       </div>
      </form>
    </div>
  )
}
