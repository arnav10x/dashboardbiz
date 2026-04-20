"use client"
import * as React from 'react';
import { DailyScore } from '@/components/tasks/DailyScore';
import { StreakDisplay } from '@/components/tasks/StreakDisplay';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Task } from '@/lib/tasks';
import { Loader2, AlertTriangle, RefreshCcw } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [streak, setStreak] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [personalizing, setPersonalizing] = React.useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks/today');
      const data = await res.json();
      
      setTasks(data.tasks || []);
      setStreak(data.streak || 0);

      // Trigger background personalization if needed
      if (data.needsPersonalization && data.tasks.length > 0) {
         setPersonalizing(true);
         await fetch('/api/ai/personalize-tasks', {
           method: 'POST',
           body: JSON.stringify({
             tasks: data.tasks,
             roadmapDayId: data.tasks[0].roadmap_day_id
           })
         });
         // Refetch to grab the newly minted personalized tasks
         const resUpdate = await fetch('/api/tasks/today');
         const dataUpdate = await resUpdate.json();
         setTasks(dataUpdate.tasks || []);
         setPersonalizing(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggle = async (id: string, state: boolean) => {
     // Optimistic update
     setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: state } : t));
     
     // API sync
     try {
       await fetch(`/api/tasks/${id}/complete`, {
         method: 'POST',
         body: JSON.stringify({ isCompleted: state })
       });
     } catch (e) {
       // Rollback on failure
       setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: !state } : t));
     }
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const isDayWon = completedCount >= 2;

  if (loading) {
     return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-600 h-8 w-8" /></div>
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Today's Executions</h1>
          <p className="text-zinc-400">Complete 2 out of 3 actions to maintain your active streak.</p>
          <div className="max-w-[200px]">
            <DailyScore completed={completedCount} total={tasks.length} />
          </div>
        </div>
        <StreakDisplay streak={streak} />
      </div>

      {/* 3 Days Inactive Banner Simulation Logic */}
      {false && ( // Disabled rendering block; business logic placeholder for warning banner 
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-md flex items-center gap-3">
           <AlertTriangle className="h-5 w-5 text-red-500" />
           <p className="text-sm font-medium text-red-100">You haven't executed a required daily task in 72 hours. Excuses burn capital.</p>
        </div>
      )}

      {personalizing && (
        <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-4 py-3 rounded-lg text-indigo-300">
           <RefreshCcw className="h-4 w-4 animate-spin text-indigo-400" />
           <span className="text-sm font-medium">Your AI Coach is tailoring today's specific strategies to your niche parameters...</span>
        </div>
      )}

      <div className="space-y-4 pt-2">
        {tasks.map(task => (
           <TaskCard 
             key={task.id}
             id={task.id}
             title={task.title}
             isCompleted={task.is_completed}
             isPersonalized={task.is_personalized}
             onToggle={handleToggle}
           />
        ))}
        {tasks.length === 0 && (
           <p className="text-center text-zinc-500 py-10">No tasks configured for today in seed roadmap.</p>
        )}
      </div>

      <div className="pt-8 flex justify-center">
         {isDayWon && (
           <p className="text-xs uppercase tracking-widest font-bold text-emerald-500 animate-pulse">Daily quota achieved</p>
         )}
      </div>

    </div>
  )
}
