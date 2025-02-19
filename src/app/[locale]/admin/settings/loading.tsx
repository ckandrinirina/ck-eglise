import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function LoadingSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-[150px] sm:w-[200px]" />
          <Skeleton className="h-4 w-[250px] sm:w-[300px]" />
        </div>
        <Skeleton className="h-10 w-full sm:w-[120px]" />
      </div>

      <Separator />

      <div className="grid gap-6">
        <Card className="p-4 sm:p-6">
          <Skeleton className="h-6 w-[200px] mb-6" />
          <div className="space-y-6">
            <div>
              <Skeleton className="h-5 w-[100px] mb-2" />
              <Skeleton className="h-4 w-[250px] mb-4" />
              <Skeleton className="h-10 w-full max-w-sm" />
            </div>
            <div>
              <Skeleton className="h-5 w-[120px] mb-2" />
              <Skeleton className="h-4 w-[200px] mb-4" />
              <Skeleton className="h-10 w-full max-w-sm" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <Skeleton className="h-6 w-[180px] mb-6" />
          <div>
            <Skeleton className="h-5 w-[160px] mb-2" />
            <Skeleton className="h-4 w-[280px] mb-4" />
            <Skeleton className="h-10 w-full max-w-sm" />
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-4 sm:hidden">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
