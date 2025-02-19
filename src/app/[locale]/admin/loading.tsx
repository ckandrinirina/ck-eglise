import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-[200px] sm:w-[250px]" />
        <Skeleton className="h-4 w-[300px] sm:w-[350px] mt-2" />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 sm:p-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-8 w-[80px]" />
              <Skeleton className="h-4 w-[140px]" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="p-4 sm:p-6">
          <Skeleton className="h-6 w-[150px] mb-4" />
          <Skeleton className="h-[200px] sm:h-[250px] w-full" />
        </Card>

        <Card className="p-4 sm:p-6">
          <Skeleton className="h-6 w-[150px] mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 last:border-0"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[120px] sm:w-[140px]" />
                  <Skeleton className="h-3 w-[80px] sm:w-[100px]" />
                </div>
                <Skeleton className="h-3 w-[100px] mt-2 sm:mt-0" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
