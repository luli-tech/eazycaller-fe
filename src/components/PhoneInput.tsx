import { useEffect, useMemo, useState } from "react";
import { Globe2, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CallStatus } from "@/types/call";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onDialCodeChange?: (dialCode: string) => void;
  disabled: boolean;
  status: CallStatus;
}

const countryCodes = [
  { country: "Nigeria", iso: "NG", dialCode: "+234" },
  { country: "United States", iso: "US", dialCode: "+1" },
  { country: "United Kingdom", iso: "GB", dialCode: "+44" },
  { country: "Ghana", iso: "GH", dialCode: "+233" },
  { country: "Kenya", iso: "KE", dialCode: "+254" },
  { country: "South Africa", iso: "ZA", dialCode: "+27" },
  { country: "Canada", iso: "CA", dialCode: "+1" },
  { country: "India", iso: "IN", dialCode: "+91" },
  { country: "China", iso: "CN", dialCode: "+86" },
  { country: "Germany", iso: "DE", dialCode: "+49" },
  { country: "France", iso: "FR", dialCode: "+33" },
  { country: "Brazil", iso: "BR", dialCode: "+55" },
].sort((a, b) => a.country.localeCompare(b.country));

const defaultCountry =
  countryCodes.find((country) => country.iso === "NG") ?? countryCodes[0];

function getSuggestedCountry() {
  const locales = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const locale of locales) {
    const region = locale.split("-")[1]?.toUpperCase();
    const country = countryCodes.find((item) => item.iso === region);
    if (country) return country;
  }

  return defaultCountry;
}

function stripDialCode(value: string, dialCode: string) {
  const normalizedValue = value.replace(/[\s-]/g, "");
  const normalizedDialCode = dialCode.replace(/\D/g, "");

  if (!normalizedValue.startsWith("+")) {
    return normalizedValue.replace(/\D/g, "");
  }

  const numberWithoutPlus = normalizedValue.slice(1);
  return numberWithoutPlus.startsWith(normalizedDialCode)
    ? numberWithoutPlus.slice(normalizedDialCode.length)
    : numberWithoutPlus;
}

export function PhoneInput({
  value,
  onChange,
  onDialCodeChange,
  disabled,
  status,
}: PhoneInputProps) {
  const suggestedCountry = useMemo(() => getSuggestedCountry(), []);
  const [selectedIso, setSelectedIso] = useState(suggestedCountry.iso);
  const selectedCountry =
    countryCodes.find((country) => country.iso === selectedIso) ?? suggestedCountry;

  useEffect(() => {
    onDialCodeChange?.(selectedCountry.dialCode);

    if (!value) {
      onChange(selectedCountry.dialCode);
    }
  }, [onChange, onDialCodeChange, selectedCountry.dialCode, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow only digits, +, spaces, dashes
    const filtered = raw.replace(/[^\d+\s-]/g, "");
    if (!filtered.startsWith("+")) {
      onChange(`${selectedCountry.dialCode}${filtered.replace(/\D/g, "")}`);
      return;
    }

    onChange(filtered);
  };

  const handleCountryChange = (iso: string) => {
    const nextCountry = countryCodes.find((country) => country.iso === iso);
    if (!nextCountry) return;

    const subscriberNumber = stripDialCode(value, selectedCountry.dialCode);
    setSelectedIso(iso);
    onChange(`${nextCountry.dialCode}${subscriberNumber}`);
  };

  const isValid = /^\+\d{7,15}$/.test(value.replace(/[\s-]/g, ""));

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Phone Number
      </label>
      <div className="grid grid-cols-[minmax(8.5rem,0.42fr)_minmax(0,1fr)] gap-2">
        <Select
          value={selectedIso}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-14 bg-secondary border-border font-mono">
            <Globe2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countryCodes.map((country) => (
              <SelectItem key={country.iso} value={country.iso}>
                {country.iso} {country.dialCode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="tel"
            placeholder={`${selectedCountry.dialCode} 801 234 5678`}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className="pl-12 h-14 text-lg font-mono bg-secondary border-border focus:border-primary focus:ring-primary/20 placeholder:text-muted-foreground/40"
          />
        </div>
      </div>
      {value && !isValid && (
        <p className="text-xs text-destructive">
          Enter the full phone number with country code (e.g., {selectedCountry.dialCode}8012345678)
        </p>
      )}
    </div>
  );
}
