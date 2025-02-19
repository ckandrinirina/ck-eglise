import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingUsers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-[150px] sm:w-[200px]" />
          <Skeleton className="h-4 w-[250px] sm:w-[300px]" />
        </div>
        <Skeleton className="h-10 w-full sm:w-[120px]" />
      </div>

      <Card className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="p-4">
            <div className="grid grid-cols-5 gap-4 border-b pb-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[40px]" />
            </div>
            <div className="space-y-4 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-4 items-center">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[180px]" />
                  <Skeleton className="h-4 w-[90px]" />
                  <Skeleton className="h-6 w-[70px] rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
