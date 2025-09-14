import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
}

export function DateRangePicker({ startDate, endDate, onDateChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(
    startDate ? new Date(startDate + 'T00:00:00') : undefined
  );
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(
    endDate ? new Date(endDate + 'T00:00:00') : undefined
  );

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
  };

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      onDateChange(formatDate(tempStartDate), formatDate(tempEndDate));
    } else if (tempStartDate) {
      onDateChange(formatDate(tempStartDate), "");
    } else if (tempEndDate) {
      onDateChange("", formatDate(tempEndDate));
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStartDate(undefined);
    setTempEndDate(undefined);
    onDateChange("", "");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {startDate && endDate ? (
            `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
          ) : startDate ? (
            `De: ${formatDisplayDate(startDate)}`
          ) : endDate ? (
            `Até: ${formatDisplayDate(endDate)}`
          ) : (
            "Selecionar período"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data de início</label>
            <Calendar
              mode="single"
              selected={tempStartDate}
              onSelect={setTempStartDate}
              className="rounded-md border"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Data de fim</label>
            <Calendar
              mode="single"
              selected={tempEndDate}
              onSelect={setTempEndDate}
              className="rounded-md border"
              disabled={(date) => tempStartDate ? date < tempStartDate : false}
            />
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button onClick={handleApply} size="sm" className="flex-1">
              Aplicar
            </Button>
            <Button onClick={handleClear} variant="outline" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
