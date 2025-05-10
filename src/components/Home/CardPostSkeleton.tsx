import { Skeleton } from "@/components/ui/skeleton"; 
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { Separator } from "../ui/separator";

export function CardPostSkeleton() {
    return (
        <Card className="w-full max-w-lg shadow-none flex flex-col hover:shadow-md transition-shadow h-full">
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-3 w-[80px]" />
                    </div>
                </div>
                <Skeleton className="h-6 w-[80px] rounded-full" />
            </CardHeader>

            {/* Content */}
            <CardContent className="p-6 flex-1 flex flex-col justify-between">
                {/* Location */}
                <div className="flex items-center text-sm mb-4">
                    <Skeleton className="h-4 w-[150px]" />
                </div>

                {/* Job Title and Employment Type */}
                <div className="flex items-center mb-6">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[80px] ml-2" />
                </div>

                {/* Requirements */}
                <div className="mb-4 flex items-start">
                    <Skeleton className="h-5 w-5 mr-4" />
                    <div>
                        <Skeleton className="h-6 w-[150px] mb-2" />
                        <Skeleton className="h-4 w-[400px]" />
                    </div>
                </div>

                {/* Interview Process */}
                <div className="mb-4 flex items-start">
                    <Skeleton className="h-5 w-5 mr-4" />
                    <div>
                        <Skeleton className="h-6 w-[150px] mb-2" />
                        <Skeleton className="h-4 w-[400px]" />
                    </div>
                </div>

                {/* Application Deadline */}
                <div className="flex items-center gap-2 text-sm mt-4 justify-end">
                    <Skeleton className="h-4 w-[120px]" />
                </div>

                <Separator className="my-4" />

                {/* Salary */}
                <div className="flex items-baseline">
                    <Skeleton className="h-8 w-[150px]" />
                    <Skeleton className="h-4 w-[80px] ml-2" />
                </div>
            </CardContent>

            {/* Footer Buttons */}
            <CardFooter className="p-6 flex flex-col gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    );
}
