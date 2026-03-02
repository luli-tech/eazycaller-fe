import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CallStatus } from "@/types/call";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  status: CallStatus;
}

export function PhoneInput({ value, onChange, disabled, status }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow only digits, +, spaces, dashes
    const filtered = raw.replace(/[^\d+\s-]/g, "");
    onChange(filtered);
  };

  const isValid = /^\+\d{7,15}$/.test(value.replace(/[\s-]/g, ""));

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Phone Number
      </label>
      <div className="relative">
        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="tel"
          placeholder="+234 801 234 5678"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="pl-12 h-14 text-lg font-mono bg-secondary border-border focus:border-primary focus:ring-primary/20 placeholder:text-muted-foreground/40"
        />
      </div>
      {value && !isValid && (
        <p className="text-xs text-destructive">
          Enter a valid E.164 number (e.g., +2348012345678)
        </p>
      )}
    </div>
  );
}
