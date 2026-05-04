import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
  label?: string;
}

export function CountdownTimer({ targetDate, label }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const t = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  const units = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <div className="text-center">
      {label && <p className="text-sm text-muted-foreground mb-3 font-medium uppercase tracking-wider">{label}</p>}
      <div className="flex gap-3 justify-center">
        {units.map(u => (
          <div key={u.label} className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-display text-2xl sm:text-3xl font-bold shadow-lg">
              {u.value}
            </div>
            <span className="text-xs text-muted-foreground mt-1.5 font-medium">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
