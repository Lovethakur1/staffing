import { useState, useEffect } from "react";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Clock } from "lucide-react";

interface TimeInputProps {
  value?: string; // Format: "14:30" or "2:30 PM"
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function TimeInput({
  value = "",
  onChange,
  placeholder = "Select time",
  required = false,
  disabled = false,
  id,
  className = "",
}: TimeInputProps) {
  // Parse initial value
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: "", minute: "", period: "AM" };
    
    // Check if already in AM/PM format
    if (timeStr.includes("AM") || timeStr.includes("PM")) {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        return {
          hour: parseInt(match[1], 10).toString(),
          minute: match[2],
          period: match[3].toUpperCase(),
        };
      }
    }
    
    // Parse 24-hour format
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr) || 0;
    const minute = minuteStr || "00";
    let period = "AM";
    
    if (hour >= 12) {
      period = "PM";
      if (hour > 12) hour -= 12;
    }
    if (hour === 0) hour = 12;
    
    return {
      hour: hour.toString(),
      minute,
      period,
    };
  };

  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  useEffect(() => {
    const parsed = parseTime(value);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period as "AM" | "PM");
  }, [value]);

  const formatTime = (h: string, m: string, p: string) => {
    if (!h || !m) return "";
    
    // Return in 12-hour format with AM/PM
    const formattedHour = h.padStart(2, '0');
    const formattedMinute = m.padStart(2, '0');
    return `${formattedHour}:${formattedMinute} ${p}`;
  };

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    if (onChange && minute) {
      onChange(formatTime(newHour, minute, period));
    }
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    if (onChange && hour) {
      onChange(formatTime(hour, newMinute, period));
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod as "AM" | "PM");
    if (onChange && hour && minute) {
      onChange(formatTime(hour, minute, newPeriod));
    }
  };

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    return h.toString();
  });

  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = ["00", "15", "30", "45"];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="relative flex-1 min-w-0">
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Select value={hour} onValueChange={handleHourChange} disabled={disabled} required={required}>
          <SelectTrigger id={id} className="pl-9">
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent>
            {hourOptions.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <span className="text-gray-500 flex-shrink-0">:</span>
      
      <div className="flex-1 min-w-0">
        <Select value={minute} onValueChange={handleMinuteChange} disabled={disabled} required={required}>
          <SelectTrigger>
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-[70px] flex-shrink-0">
        <Select value={period} onValueChange={handlePeriodChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
