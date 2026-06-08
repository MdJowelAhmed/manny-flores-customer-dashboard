import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppSelector } from '@/redux/hooks'
import { useResendOtpMutation, useVerifyEmailMutation } from '@/redux/api/authApi'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'

const OTP_LENGTH = 6

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

export default function VerifyEmail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { passwordResetEmail, verificationEmail } = useAppSelector((state) => state.auth)

  const isPasswordReset = location.state?.type === 'reset'
  const email = isPasswordReset ? passwordResetEmail : verificationEmail

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation()
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation()

  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [resendTimer, setResendTimer] = useState(30)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError('')

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, OTP_LENGTH)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split('').forEach((char, index) => {
      if (index < OTP_LENGTH) newOtp[index] = char
    })
    setOtp(newOtp)

    const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')

    if (!email) {
      setError(t('auth.missingVerificationEmail', { defaultValue: 'Email is missing. Please sign up again.' }))
      return
    }

    if (code.length !== OTP_LENGTH) {
      setError(t('auth.pleaseCompleteCode'))
      return
    }

    setError('')
    setSuccessMessage('')

    try {
      const result = await verifyEmail({
        email,
        oneTimeCode: Number.parseInt(code, 10),
      }).unwrap()

      if (!result.success) {
        setError(result.message || t('auth.invalidVerificationCode'))
        return
      }

      if (isPasswordReset) {
        navigate('/auth/reset-password')
      } else {
        navigate('/auth/login', {
          state: { verified: true, message: result.message },
        })
      }
    } catch (err) {
      setError(getApiErrorMessage(err as FetchBaseQueryError, t('auth.invalidVerificationCode')))
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError(t('auth.missingVerificationEmail', { defaultValue: 'Email is missing. Please sign up again.' }))
      return
    }

    setError('')
    setSuccessMessage('')

    try {
      const result = await resendOtp({ email }).unwrap()
      setResendTimer(30)
      setSuccessMessage(result.message || t('auth.otpResentSuccess', { defaultValue: 'A new code has been sent to your email.' }))
    } catch (err) {
      setError(getApiErrorMessage(err as FetchBaseQueryError, t('auth.anErrorOccurred')))
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

      <Link
        to={
          isPasswordReset
            ? '/auth/forgot-password'
            : location.state?.type === 'signup'
              ? '/auth/signup'
              : '/auth/login'
        }
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('auth.back')}
      </Link>

      <div className="space-y-2 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t('auth.verifyYourEmail')}</h1>
        <p className="text-muted-foreground">{t('auth.sentSixDigitCode')}</p>
        <p className="font-medium">{email || t('auth.yourEmail')}</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm text-center"
        >
          {successMessage}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={cn(
                'w-12 h-14 text-center text-xl font-semibold',
                error && 'border-destructive'
              )}
            />
          ))}
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isVerifying}>
          {!isVerifying && (
            <>
              {t('auth.verify')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.didntReceiveCode')}{' '}
          {resendTimer > 0 ? (
            <span className="text-muted-foreground">
              {t('auth.resendIn', { seconds: resendTimer })}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-primary font-medium hover:underline disabled:opacity-50"
            >
              {isResending ? t('common.processing', { defaultValue: 'Processing...' }) : t('auth.clickToResend')}
            </button>
          )}
        </p>
      </div>
    </div>
  )
}
