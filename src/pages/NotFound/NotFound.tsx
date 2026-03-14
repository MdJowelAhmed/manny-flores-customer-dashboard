import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-primary/20">404</h1>
          <h2 className="text-3xl font-semibold text-accent">{t('notFound.pageNotFound')}</h2>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground text-lg">
            {t('notFound.oops')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('notFound.pageMoved')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('notFound.goBack')}
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            {t('notFound.goToDashboard')}
          </Button>
        </div>
      </div>
    </div>
  )
}
