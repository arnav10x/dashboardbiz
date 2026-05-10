"use client"
import * as React from 'react';

export function ClockPills() {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  return (
    <div className="flex items-center gap-1.5">
      {[date, time, day].map((val) => (
        <span
          key={val}
          className="px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide"
          style={{ background: 'var(--app-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          {val}
        </span>
      ))}
    </div>
  );
}

export function GreetingWord() {
  const [greeting, setGreeting] = React.useState('Good Morning');

  React.useEffect(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) setGreeting('Good Morning');
    else if (h >= 12 && h < 17) setGreeting('Good Afternoon');
    else if (h >= 17 && h < 21) setGreeting('Good Evening');
    else setGreeting('Working Late');
  }, []);

  return <>{greeting}</>;
}
