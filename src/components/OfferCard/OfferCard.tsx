import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Clock, CheckCircle, XCircle } from "lucide-react";

interface Offer {
  _id: string;
  jobTitle: string;
  companyName: string;
  status: "Pending" | "Interview" | "Accepted" | "Rejected";
  appliedAt: number;
  resume?: string;
}

export default function OfferCard({ offer }: { offer: Offer }) {
  const statusBadge = {
    Pending: { icon: <Clock size={16} className="text-yellow-500" />, color: "bg-yellow-100 text-yellow-800" },
    Interview: { icon: <CheckCircle size={16} className="text-blue-500" />, color: "bg-blue-100 text-blue-800" },
    Accepted: { icon: <CheckCircle size={16} className="text-green-500" />, color: "bg-green-100 text-green-800" },
    Rejected: { icon: <XCircle size={16} className="text-red-500" />, color: "bg-red-100 text-red-800" },
  }[offer.status];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle>{offer.jobTitle}</CardTitle>
        <CardDescription>{offer.companyName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Applied At:</span>
          <span className="text-sm font-medium">
            {new Date(offer.appliedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Badge className={`${statusBadge.color} flex items-center gap-1`}>
          {statusBadge.icon}
          {offer.status}
        </Badge>
        {offer.resume && (
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Download CV
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}