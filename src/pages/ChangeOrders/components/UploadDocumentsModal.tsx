import { useState } from 'react'
import { ModalWrapper } from '@/components/common/ModalWrapper'
import { ImageUploader } from '@/components/common/ImageUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface UploadDocumentsModalProps {
  open: boolean
  onClose: () => void
}

export function UploadDocumentsModal({ open, onClose }: UploadDocumentsModalProps) {
  const [projectName, setProjectName] = useState('')
  const [changeAmount, setChangeAmount] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')

  const reset = () => {
    setProjectName('')
    setChangeAmount('')
    setFile(null)
    setDescription('')
  }

  const handleSubmit = () => {
    // Here we could integrate API upload later
    reset()
    onClose()
  }

  const disableSubmit = !projectName || !changeAmount || !file

  return (
    <ModalWrapper
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title="Upload Documents"
      description="Attach supporting documents for a change order."
      size="md"
      className="bg-white"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={disableSubmit} onClick={handleSubmit}>
            Create Change Order
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Select Project
            </label>
            <Input
              placeholder="Choose project..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Change amount
            </label>
            <Input
              placeholder="0.00"
              type="number"
              value={changeAmount}
              onChange={(e) => setChangeAmount(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Upload document
          </label>
          <ImageUploader value={file} onChange={setFile} />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Description
          </label>
          <Textarea
            placeholder="e.g., Customer requested upgrade, design modification"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
    </ModalWrapper>
  )
}

