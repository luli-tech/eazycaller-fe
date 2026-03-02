import { Delete } from "lucide-react";

interface KeypadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

const keys = [
  { digit: "1", sub: "" },
  { digit: "2", sub: "ABC" },
  { digit: "3", sub: "DEF" },
  { digit: "4", sub: "GHI" },
  { digit: "5", sub: "JKL" },
  { digit: "6", sub: "MNO" },
  { digit: "7", sub: "PQRS" },
  { digit: "8", sub: "TUV" },
  { digit: "9", sub: "WXYZ" },
  { digit: "*", sub: "" },
  { digit: "0", sub: "+" },
  { digit: "#", sub: "" },
];

export function Keypad({ onDigit, onDelete, disabled }: KeypadProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {keys.map(({ digit, sub }) => (
          <button
            key={digit}
            type="button"
            disabled={disabled}
            onClick={() => onDigit(digit)}
            className="h-16 rounded-xl bg-secondary hover:bg-secondary/80 active:bg-muted border border-border transition-all duration-100 flex flex-col items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
          >
            <span className="text-xl font-semibold text-foreground font-mono">{digit}</span>
            {sub && (
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground font-medium">
                {sub}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="h-10 w-16 rounded-lg hover:bg-secondary active:bg-muted transition-colors flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
        >
          <Delete className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
