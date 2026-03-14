import { FormInput } from '@/components/common/Form'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface CustomerDetailsCardProps {
  customerName: string
  projectName: string
  onCustomerNameChange: (value: string) => void
  onProjectNameChange: (value: string) => void
}

export function CustomerDetailsCard({
  customerName,
  projectName,
  onCustomerNameChange,
  onProjectNameChange,
}: CustomerDetailsCardProps) {
  return (
    <Card className="bg-white border-gray-100 shadow-sm">
      <CardHeader>
        <h3 className="text-base font-bold text-foreground">Customer Details</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormInput
          label="Customer Name"
          placeholder="Enter customer name."
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          className="bg-gray-50"
        />
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
