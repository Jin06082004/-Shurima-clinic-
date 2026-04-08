import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-surface-container rounded-lg',
        className
      )}
      {...props}
    />
  );
}

export function UserCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-40 h-3" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-md" />
      </div>
      <div className="space-y-3">
        <Skeleton className="w-full h-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>
    </div>
  );
}

export function UserListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}
