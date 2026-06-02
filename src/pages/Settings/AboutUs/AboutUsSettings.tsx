import { Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useGetLegalDataQuery } from '@/redux/slices/customer/legalApi'
import Spinner from '@/components/common/Spinner'


export default function AboutUsSettings() {
  const { data: aboutRes, isLoading } = useGetLegalDataQuery({ type: "ABOUT" })
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
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>About Us</CardTitle>
              <CardDescription>
                View your platform's About Us content
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: aboutRes?.data?.content }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
