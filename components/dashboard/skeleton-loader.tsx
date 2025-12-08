import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 md:pb-8 max-w-md mx-auto space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 border shadow-sm flex flex-col justify-between h-24">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-10" />
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <Skeleton className="h-10 rounded-md" />
        <Skeleton className="h-10 rounded-md" />
      </div>

      {/* Filter & Search */}
      <Card className="p-3 space-y-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </Card>

      {/* Tree List */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl border shadow-sm bg-card">
             <div className="flex items-center gap-3 w-full">
                <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                <div className="space-y-2 w-full">
                   <div className="flex gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                   </div>
                   <Skeleton className="h-3 w-32" />
                </div>
             </div>
             <Skeleton className="h-5 w-5 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
