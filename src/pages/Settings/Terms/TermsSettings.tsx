import { FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'

const termsContent = `<h1>Terms and Conditions</h1>
<p><em>Last updated: January 2024</em></p>

<h2>1. Introduction</h2>
<p>Welcome to our Dashboard. By accessing or using our service, you agree to be bound by these Terms and Conditions.</p>

<h2>2. Use License</h2>
<p>Permission is granted to temporarily use our dashboard for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
<ul>
  <li>Modify or copy the materials</li>
  <li>Use the materials for any commercial purpose</li>
  <li>Attempt to decompile or reverse engineer any software</li>
  <li>Remove any copyright or other proprietary notations</li>
</ul>

<h2>3. Disclaimer</h2>
<p>The materials on our dashboard are provided on an <strong>'as is'</strong> basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including:</p>
<ul>
  <li>Implied warranties or conditions of merchantability</li>
  <li>Fitness for a particular purpose</li>
  <li>Non-infringement of intellectual property</li>
</ul>

<h2>4. Limitations</h2>
<p>In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our dashboard.</p>

<h2>5. Accuracy of Materials</h2>
<p>The materials appearing on our dashboard could include technical, typographical, or photographic errors. We do not warrant that any of the materials are accurate, complete, or current.</p>

<h2>6. Links</h2>
<p>We have not reviewed all of the sites linked to our dashboard and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us.</p>

<h2>7. Modifications</h2>
<p>We may revise these terms of service at any time without notice. By using this dashboard you are agreeing to be bound by the then current version of these terms.</p>

<h2>8. Governing Law</h2>
<p>These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>

<hr>
<p><em>If you have any questions about these Terms and Conditions, please contact us at <a href="mailto:legal@example.com">legal@example.com</a></em></p>`

export default function TermsSettings() {
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
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Terms & Conditions</CardTitle>
              <CardDescription>
                View your platform's Terms and Conditions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: termsContent }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
