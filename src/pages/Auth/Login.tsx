import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
} from '@/redux/slices/authSlice'
import { useLoginMutation } from '@/redux/api/authApi'
import { normalizeApiRole } from '@/types/roles'
import { parseJwtPayload } from '@/utils/jwt'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

function getLoginErrorMessage(
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

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { error } = useAppSelector((state) => state.auth)
  const [login, { isLoading: isLoginLoading }] = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    dispatch(clearError())
    dispatch(loginStart())

    try {
      const result = await login({
        email: data.email,
        password: data.password,
      }).unwrap()

      const accessToken = result.data?.accessToken
      if (!result.success || !accessToken) {
        dispatch(loginFailure(result.message || t('auth.invalidEmailOrPassword')))
        return
      }

      const refreshToken = result.data?.refreshToken
      const apiRole = result.data?.role
      const jwtPayload = parseJwtPayload(accessToken)
      const role = normalizeApiRole(apiRole ?? jwtPayload?.role)

      dispatch(
        loginSuccess({
          user: {
            id: jwtPayload?.id ?? '',
            email: data.email,
            firstName: '',
            lastName: '',
            role,
          },
          token: accessToken,
          refreshToken,
        })
      )

      navigate('/dashboard', { replace: true })
    } catch (err) {
      dispatch(
        loginFailure(
          getLoginErrorMessage(
            err as FetchBaseQueryError | SerializedError,
            t('auth.invalidEmailOrPassword')
          )
        )
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

      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight">{t('auth.welcomeBack')}</h1>
        <p className="text-muted-foreground">{t('auth.enterCredentials')}</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          {error}
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
              placeholder="name@example.com"
              className={cn('pl-10', errors.email && 'border-destructive')}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t('auth.password')}</Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.enterYourPassword')}
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
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 rounded border-input"
              {...register('remember')}
            />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
              {t('auth.rememberMe')}
            </Label>
          </div>
          <Link
            to="/auth/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoginLoading}>
          {!isLoginLoading && (
            <>
              {t('auth.signIn')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.dontHaveAccount')}{' '}
        <Link to="/auth/signup" className="text-primary font-medium hover:underline">
          {t('auth.signUp')}
        </Link>
      </p>
    </div>
  )
}
