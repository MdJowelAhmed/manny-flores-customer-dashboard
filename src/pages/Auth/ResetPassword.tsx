import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  RESET_PASSWORD_TOKEN_KEY,
  useResetPasswordMutation,
} from '@/redux/api/authApi'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'auth.passwordMin8Chars')
      .regex(/[A-Z]/, 'auth.passwordNeedUppercase')
      .regex(/[a-z]/, 'auth.passwordNeedLowercase')
      .regex(/[0-9]/, 'auth.passwordNeedNumber'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.passwordsDontMatch',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

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

export default function ResetPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password = watch('password', '')

  const passwordRequirements = [
    { label: t('auth.atLeast8Chars'), met: password.length >= 8 },
    { label: t('auth.oneUppercase'), met: /[A-Z]/.test(password) },
    { label: t('auth.oneLowercase'), met: /[a-z]/.test(password) },
    { label: t('auth.oneNumber'), met: /[0-9]/.test(password) },
  ]

  const fieldError = (key: keyof ResetPasswordFormData) => {
    const err = errors[key]
    return err?.message ? t(err.message) : undefined
  }

  useEffect(() => {
    const token = localStorage.getItem(RESET_PASSWORD_TOKEN_KEY)
    if (!token) {
      navigate('/auth/forgot-password', { replace: true })
    }
  }, [navigate])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setSubmitError('')

    const token = localStorage.getItem(RESET_PASSWORD_TOKEN_KEY)
    if (!token) {
      setSubmitError(t('auth.missingResetToken', { defaultValue: 'Reset session expired. Please start again.' }))
      return
    }

    try {
      const result = await resetPassword({
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      }).unwrap()

      if (!result.success) {
        setSubmitError(result.message || t('auth.anErrorOccurred'))
        return
      }

      navigate('/auth/login', {
        replace: true,
        state: {
          passwordReset: true,
          message: result.message || t('auth.passwordResetSuccessful'),
        },
      })
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error as FetchBaseQueryError, t('auth.anErrorOccurred'))
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">M</span>
        </div>
        <span className="font-display font-bold text-2xl">{t('auth.dashboard')}</span>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <Link
          to="/auth/verify-email"
          state={{ type: 'reset' }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('auth.back')}
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t('auth.setNewPassword')}</h1>
          <p className="text-muted-foreground">{t('auth.newPasswordMustBeDifferent')}</p>
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
            <Label htmlFor="password">{t('auth.newPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.enterNewPassword')}
                className={cn('pl-10 pr-10', errors.password && 'border-destructive')}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{fieldError('password')}</p>
            )}
          </div>

          <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t('auth.passwordRequirements')}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {passwordRequirements.map((req) => (
                <div
                  key={req.label}
                  className={cn(
                    'flex items-center gap-1.5 text-xs',
                    req.met ? 'text-success' : 'text-muted-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      req.met ? 'bg-success' : 'bg-muted-foreground'
                    )}
                  />
                  {req.label}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('auth.confirmNewPassword')}
                className={cn('pl-10 pr-10', errors.confirmPassword && 'border-destructive')}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{fieldError('confirmPassword')}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            {!isLoading && (
              <>
                {t('auth.resetPassword')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
