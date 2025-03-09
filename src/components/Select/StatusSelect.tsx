import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { Check, Clock, CheckCircle, XCircle } from "lucide-react";
  
  export function StatusSelect({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus:border-blue-500 transition-colors">
          <SelectValue placeholder="Select status">
            <div className="flex items-center gap-2">
              {value === "Pending" && <Clock className="w-4 h-4 text-yellow-500" />}
              {value === "Interview" && <CheckCircle className="w-4 h-4 text-blue-500" />}
              {value === "Accepted" && <Check className="w-4 h-4 text-green-500" />}
              {value === "Rejected" && <XCircle className="w-4 h-4 text-red-500" />}
              <span>{value || "Select status"}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-lg">
          <SelectItem value="Pending">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span>Pending</span>
            </div>
          </SelectItem>
          <SelectItem value="Interview">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span>Interview</span>
            </div>
          </SelectItem>
          <SelectItem value="Accepted">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Accepted</span>
            </div>
          </SelectItem>
          <SelectItem value="Rejected">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Rejected</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }