import { cn } from '@/lib/utils';

const StatusVariant = {
  confirmed: 'bg-primary-container text-on-primary-container',
  pending: 'bg-tertiary-fixed/10 text-tertiary-fixed',
  cancelled: 'bg-error-container text-on-error-container',
  active: 'bg-primary-container text-on-primary-container',
  inactive: 'bg-surface-container-high text-on-surface-variant',
  scheduled: 'bg-primary-container text-on-primary-container',
};

export function StatusBadge({ children, variant = 'confirmed', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        StatusVariant[variant],
        className
      )}
    >
      {children}
    </span>
  );
}