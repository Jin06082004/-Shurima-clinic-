import { cn } from '@/lib/utils';

export function Table({ children, className, ...props }) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full" {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }) {
  return (
    <thead className={cn('border-b border-outline-variant', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className, ...props }) {
  return (
    <tr
      className={cn(
        'border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-label-md text-on-surface-variant font-medium',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }) {
  return (
    <td className={cn('px-4 py-4 text-sm text-on-surface', className)}>
      {children}
    </td>
  );
}