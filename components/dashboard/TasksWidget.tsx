"use client"
import * as React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description?: string;
  is_completed: boolean;
}

export function TasksWidget({ dayNumber }: { dayNumber: number }) {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/tasks/today')
      .then(r => r.json())
      .then(d => { setTasks(d.tasks || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function toggle(id: string, current: boolean) {
    setToggling(id);
    const next = !current;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: next } : t));
    try {
      await fetch(`/api/tasks/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: next }),
      });
    } catch {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: current } : t));
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="app-card rounded-2xl p-7 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Non-Negotiable Tasks</p>
        <span className="text-[9px] font-bold border rounded-lg px-2.5 py-1 uppercase tracking-widest" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          Day {dayNumber}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tasks for today.</p>
          <Link href="/dashboard/tasks" className="text-xs mt-1 inline-block" style={{ color: 'var(--accent)' }}>Go to tasks →</Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => toggle(t.id, t.is_completed)}
              disabled={toggling === t.id}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all hover:opacity-80"
              style={{
                borderColor: t.is_completed ? 'var(--border)' : 'var(--border)',
                background: t.is_completed ? 'transparent' : 'var(--app-bg)',
                opacity: toggling === t.id ? 0.6 : 1,
              }}
            >
              {t.is_completed
                ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                : <Circle className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              }
              <p className={`text-sm font-medium ${t.is_completed ? 'line-through' : ''}`} style={{ color: t.is_completed ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                {t.title}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
