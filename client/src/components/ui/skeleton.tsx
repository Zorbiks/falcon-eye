import { cn } from 'src/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circle' | 'rect'
}

const Skeleton = ({ className, variant = 'default', ...props }: SkeletonProps) => {
  const baseStyles = 'animate-pulse bg-slate-200 dark:bg-slate-700'

  const variantStyles = {
    default: 'rounded-md h-12 w-full',
    text: 'h-4 w-full rounded-md',
    circle: 'h-10 w-10 rounded-full',
    rect: 'h-32 w-full rounded-md',
  }

  return <div className={cn(baseStyles, variantStyles[variant], className)} {...props} />
}

export { Skeleton }
