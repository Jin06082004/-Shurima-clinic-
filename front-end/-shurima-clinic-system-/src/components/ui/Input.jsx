import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export function Input({
  label,
  error,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-label-md text-on-surface-variant">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className="w-4 h-4 text-on-surface-variant" />
          </div>
        )}
        <input
          className={cn(
            'w-full px-3 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none transition-all duration-200',
            'focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed',
            Icon && 'pl-10',
            error && 'ring-2 ring-error',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-label-md text-on-surface-variant">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200',
          'focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed',
          error && 'ring-2 ring-error',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}