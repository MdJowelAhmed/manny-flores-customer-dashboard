import { Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import Spinner from '@/components/common/Spinner'
import { useGetLegalDataQuery } from '@/redux/slices/customer/legalApi'


export default function PrivacySettings() {
  const { data: privacyRes, isLoading } = useGetLegalDataQuery({ type: "PRIVACY" })
  if (isLoading) {
    return <Spinner />
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Privacy Policy</CardTitle>
              <CardDescription>
                View your platform's Privacy Policy
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: privacyRes?.data?.content }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
