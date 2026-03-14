import { useCallback, useEffect, useRef, useState } from 'react'
import { Calendar, MapPin, Camera } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import { formatDateDayMonth } from '@/utils/formatters'
import { parseISO } from 'date-fns'
import type { MyTask } from '../myTaskData'
import { ACCEPTED_IMAGE_TYPES } from '@/utils/constants'

function PhotoAddField({
  label,
  placeholder,
  file,
  onChange,
}: {
  label: string
  placeholder: string
  file: File | null
  onChange: (f: File | null) => void
}) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div>
      <p className="text-sm font-medium mb-2">{label}</p>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className="border border-input rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors bg-white"
      >
        <Camera className="h-6 w-6 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground flex-1">
          {file ? file.name : placeholder}
        </span>
        {file && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onChange(null)
            }}
            className="text-destructive hover:text-destructive"
          >
            {t('myTask.remove')}
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  )
}

interface TaskDetailsModalProps {
  open: boolean
  onClose: () => void
  task: MyTask | null
  /** When true, shows Upload Photos, Add Note, Submit. When false, details only (no form). */
  showForm?: boolean
  onSubmit?: (task: MyTask, data: { beforePhoto?: File; afterPhoto?: File; note?: string }) => void
}

export function TaskDetailsModal({
  open,
  onClose,
  task,
  showForm = false,
  onSubmit,
}: TaskDetailsModalProps) {
  const { t } = useTranslation()
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null)
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null)
  const [note, setNote] = useState('')

  const isInProgress = task?.status === 'In Progress'

  const handleClose = useCallback(() => {
    setBeforePhoto(null)
    setAfterPhoto(null)
    setNote('')
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) {
      setBeforePhoto(null)
      setAfterPhoto(null)
      setNote('')
    }
  }, [open])

  const handleSubmit = () => {
    if (task && onSubmit) {
      onSubmit(task, {
        beforePhoto: beforePhoto ?? undefined,
        afterPhoto: afterPhoto ?? undefined,
        note: note.trim() || undefined,
      })
    }
    handleClose()
  }

  if (!task) return null

  const priorityClasses: Record<string, string> = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-gray-100 text-gray-700',
  }

  const footer =
    showForm && onSubmit ? (
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          className="w-full bg-primary text-white rounded-lg"
        >
          {t('myTask.submit')}
        </Button>
      </div>
    ) : undefined

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      title={t('myTask.taskDetails')}
      size="xl"
      className="max-w-2xl bg-white"
      footer={footer}
    >
      <div className="space-y-6 -mt-2">
        {/* Header: Project, Priority, Task Name, Status */}
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-lg text-accent">{task.projectName}</h3>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                      priorityClasses[task.priority] ?? 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{t('myTask.taskName')} </span>
                  {task.taskName}
                </p>
              </div>
              {isInProgress && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {t('myTask.inProgress')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Deadline & Location */}
        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-success shrink-0" />
              <span>
                <span className="font-medium text-foreground">{t('myTask.deadline')} </span>
                {formatDateDayMonth(parseISO(task.deadline))}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <span>
                <span className="font-medium text-foreground">{t('myTask.location')} </span>
                {task.location}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="font-bold text-foreground mb-2">{t('myTask.description')}</p>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </CardContent>
        </Card>

        {/* Instruction */}
        {task.instructions && task.instructions.length > 0 && (
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <p className="font-bold text-foreground mb-3">{t('myTask.instruction')}</p>
              <ol className="space-y-2">
                {task.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-muted-foreground">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Material Required */}
        {task.materials && task.materials.length > 0 && (
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <p className="font-bold text-foreground mb-3">{t('myTask.materialRequired')}</p>
              <div className="space-y-3">
                {task.materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{material.name}</p>
                      <p className="text-xs text-muted-foreground">{material.quantity}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-success text-success bg-green-50 hover:bg-green-100"
                    >
                      {t('myTask.assign')}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Photos & Add Note - Only when showForm (Start/Complete flow) */}
        {showForm && (
          <>
            <Card className="rounded-xl">
              <CardContent className="p-4 space-y-4">
                <p className="font-bold text-foreground">{t('myTask.uploadPhotos')}</p>
                <div className="space-y-4">
                  <PhotoAddField
                    label={t('myTask.beforePhotos')}
                    placeholder={t('myTask.addBeforePhoto')}
                    file={beforePhoto}
                    onChange={setBeforePhoto}
                  />
                  <PhotoAddField
                    label={t('myTask.afterPhoto')}
                    placeholder={t('myTask.addAfterPhoto')}
                    file={afterPhoto}
                    onChange={setAfterPhoto}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardContent className="p-4">
                <p className="font-bold text-foreground mb-2">{t('myTask.addNote')}</p>
                <Textarea
                  placeholder={t('myTask.enterNotes')}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ModalWrapper>
  )
}
