export function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="aspect-square bg-muted animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-6 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-muted rounded w-20 animate-pulse" />
              <div className="h-4 bg-muted rounded w-12 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
