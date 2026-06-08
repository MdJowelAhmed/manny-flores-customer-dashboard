import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppDispatch } from '@/redux/hooks'
import { setPasswordResetEmail } from '@/redux/slices/authSlice'
import { useForgotPasswordMutation } from '@/redux/api/authApi'
import { cn } from '@/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'

const forgotPasswordSchema = z.object({
  email: z.string().email('auth.pleaseEnterValidEmail'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

function getApiErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
  fallback: string
): string {
  if (!error) return fallback
  if ('data' in error && error.data && typeof error.data === 'object') {
    const data = error.data as { message?: string }
    if (data.message) return data.message
  }
  if ('message' in error && error.message) return error.message
  return fallback
}

export default function ForgotPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const fieldError = (key: keyof ForgotPasswordFormData) => {
    const err = errors[key]
    return err?.message ? t(err.message) : undefined
  }

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setSubmitError('')

    try {
      const result = await forgotPassword({ email: data.email.trim() }).unwrap()

      if (!result.success) {
        setSubmitError(result.message || t('auth.anErrorOccurred'))
        return
      }

      dispatch(setPasswordResetEmail(data.email.trim()))
      setSubmittedEmail(data.email.trim())
      setIsSuccess(true)
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error as FetchBaseQueryError, t('auth.anErrorOccurred'))
      )
    }
  }

  const handleContinue = () => {
    navigate('/auth/verify-email', { state: { type: 'reset' } })
  }

  return (
    <div className="space-y-6">
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">M</span>
        </div>
        <span className="font-display font-bold text-2xl">{t('auth.dashboard')}</span>
      </div>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToLogin')}
            </Link>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{t('auth.forgotPasswordTitle')}</h1>
              <p className="text-muted-foreground">{t('auth.noWorries')}</p>
            </div>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                {submitError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.enterYourEmail')}
                    className={cn('pl-10', errors.email && 'border-destructive')}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{fieldError('email')}</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                {!isLoading && (
                  <>
                    {t('auth.sendResetLink')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{t('auth.checkYourEmail')}</h1>
              <p className="text-muted-foreground">{t('auth.sentVerificationCode')}</p>
              <p className="font-medium">{submittedEmail}</p>
            </div>

            <Button onClick={handleContinue} className="w-full" size="lg">
              {t('auth.enterCode')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-sm text-muted-foreground">
              {t('auth.didntReceiveEmail')}{' '}
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="text-primary font-medium hover:underline"
              >
                {t('auth.clickToResend')}
              </button>
            </p>

            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToLogin')}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
