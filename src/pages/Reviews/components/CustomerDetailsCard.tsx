import { FormInput } from '@/components/common/Form'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface CustomerDetailsCardProps {
  projectName: string
  onProjectNameChange: (value: string) => void
}

export function CustomerDetailsCard({
  projectName,
  onProjectNameChange,
}: CustomerDetailsCardProps) {
  return (
    <Card className="bg-white border-gray-100 shadow-sm">
      <CardHeader>
        <h3 className="text-base font-bold text-foreground">Project Details</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormInput
          label="Project Name"
          placeholder="Enter project name."
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="bg-gray-50"
        />
      </CardContent>
    </Card>
  )
}
