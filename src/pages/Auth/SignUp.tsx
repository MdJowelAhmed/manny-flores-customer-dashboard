import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  User,
  Phone,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppDispatch } from '@/redux/hooks'
import { setVerificationEmail } from '@/redux/slices/authSlice'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const signUpSchema = z
  .object({
    firstName: z.string().min(2, 'auth.firstNameMinChars'),
    lastName: z.string().min(2, 'auth.lastNameMinChars'),
    email: z.string().email('auth.pleaseEnterValidEmail'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'auth.passwordMin8Chars')
      .regex(/[A-Z]/, 'auth.passwordNeedUppercase')
      .regex(/[a-z]/, 'auth.passwordNeedLowercase')
      .regex(/[0-9]/, 'auth.passwordNeedNumber'),
    confirmPassword: z.string(),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'auth.mustAgreeToTerms' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.passwordsDontMatch',
    path: ['confirmPassword'],
  })

type SignUpFormData = z.infer<typeof signUpSchema>

export default function SignUp() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: undefined,
    },
  })

  const password = watch('password', '')

  const passwordRequirements = [
    { label: t('auth.atLeast8Chars'), met: password.length >= 8 },
    { label: t('auth.oneUppercase'), met: /[A-Z]/.test(password) },
    { label: t('auth.oneLowercase'), met: /[a-z]/.test(password) },
    { label: t('auth.oneNumber'), met: /[0-9]/.test(password) },
  ]

  const fieldError = (key: keyof SignUpFormData) => {
    const err = errors[key]
    return err?.message ? t(err.message) : undefined
  }

  const onSubmit = async (data: SignUpFormData) => {
    setSubmitError('')
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (data.email === 'customer@example.com') {
        setSubmitError(t('auth.emailAlreadyRegistered'))
        return
      }

      dispatch(setVerificationEmail(data.email))
      navigate('/auth/verify-email', {
        state: {
          type: 'signup',
          firstName: data.firstName,
          lastName: data.lastName,
        },
      })
    } catch {
      setSubmitError(t('auth.anErrorOccurred'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="lg:hidden flex items-center justify-center gap-3 mb-8"
      >
        <motion.div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">M</span>
        </motion.div>
        <span className="font-display font-bold text-2xl">{t('auth.dashboard')}</span>
      </motion.div>

      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight">{t('auth.createAccount')}</h1>
        <p className="text-muted-foreground">{t('auth.signUpDescription')}</p>
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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('auth.firstName')}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                placeholder={t('auth.firstNamePlaceholder')}
                className={cn('pl-10', errors.firstName && 'border-destructive')}
                {...register('firstName')}
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-destructive">{fieldError('firstName')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">{t('auth.lastName')}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="lastName"
                type="text"
                placeholder={t('auth.lastNamePlaceholder')}
                className={cn('pl-10', errors.lastName && 'border-destructive')}
                {...register('lastName')}
              />
            </div>
            {errors.lastName && (
              <p className="text-xs text-destructive">{fieldError('lastName')}</p>
            )}
          </div>
        </motion.div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative"
          >
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={cn('pl-10', errors.email && 'border-destructive')}
              {...register('email')}
            />
          </motion.div>
          {errors.email && (
            <p className="text-xs text-destructive">{fieldError('email')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            {t('auth.phone')}{' '}
            <span className="text-muted-foreground font-normal">({t('auth.optional')})</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder={t('auth.phonePlaceholder')}
              className="pl-10"
              {...register('phone')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
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
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{fieldError('password')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('auth.confirmYourPassword')}
              className={cn('pl-10 pr-10', errors.confirmPassword && 'border-destructive')}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={
                showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{fieldError('confirmPassword')}</p>
          )}
        </div>

        <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t('auth.passwordRequirements')}
          </p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-2 gap-1"
          >
            {passwordRequirements.map((req) => (
              <motion.div
                key={req.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className={cn(
                  'flex items-center gap-1.5 text-xs',
                  req.met ? 'text-green-600' : 'text-muted-foreground'
                )}
              >
                {req.met ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                )}
                {req.label}
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="agreeTerms"
            className={cn(
              'mt-1 h-4 w-4 rounded border-input',
              errors.agreeTerms && 'border-destructive'
            )}
            {...register('agreeTerms')}
          />
          <Label htmlFor="agreeTerms" className="text-sm font-normal leading-snug cursor-pointer">
            {t('auth.agreeToTerms')}
          </Label>
        </div>
        {errors.agreeTerms && (
          <p className="text-xs text-destructive -mt-2">{fieldError('agreeTerms')}</p>
        )}

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          {!isLoading && (
            <>
              {t('auth.createAccountBtn')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/auth/login" className="text-primary font-medium hover:underline">
          {t('auth.signInLink')}
        </Link>
      </p>
    </div>
  )
}
