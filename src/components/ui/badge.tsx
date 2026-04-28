import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-black hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-white hover:bg-secondary/80',
        destructive:
          'border-transparent bg-secondary-foreground text-black hover:bg-destructive/80',
        outline: 'text-black',
        success:
          'border-transparent bg-green-500 text-white',
        warning:
          'border-transparent bg-secondary-foreground text-yellow-500',
        error:
          'border-transparent bg-destructive/10 text-black',
        info:
          'border-transparent bg-primary/10 text-black',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }













