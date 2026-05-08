"use client"
import * as React from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Calendar, Phone,
  RefreshCcw, AlertTriangle, CheckCircle2, Loader2, Trash2,
  ExternalLink, MapPin, AlignLeft, Link2, Clock,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface CalEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  event_type: 'meeting' | 'call' | 'follow-up' | 'other';
  lead_id?: string | null;
  leads?: { id: string; name: string; company?: string } | null;
  google_event_id?: string;
  source?: 'google';
}

interface Lead { id: string; name: string; company?: string }
interface Conflict { id: string; title: string; start_time: string; end_time: string }

// ── Helpers ──────────────────────────────────────────────────────────────────

const EVENT_COLORS: Record<string, string> = {
  meeting: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  call: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  'follow-up': 'bg-amber-500/20 border-amber-500/40 text-amber-300',
  other: 'bg-zinc-500/20 border-zinc-500/40 text-zinc-300',
  google: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
};

const EVENT_DOT: Record<string, string> = {
  meeting: 'bg-emerald-400',
  call: 'bg-blue-400',
  'follow-up': 'bg-amber-400',
  other: 'bg-zinc-400',
  google: 'bg-purple-400',
};

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: Date[] = [];

  for (let i = firstDay - 1; i >= 0; i--)
    cells.push(new Date(year, month - 1, prevMonthDays - i));

  for (let d = 1; d <= daysInMonth; d++)
    cells.push(new Date(year, month, d));

  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++)
    cells.push(new Date(year, month + 1, d));

  return cells;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── Event Modal ──────────────────────────────────────────────────────────────

function EventModal({
  initialDate,
  editEvent,
  leads,
  onSave,
  onDelete,
  onClose,
}: {
  initialDate?: Date;
  editEvent?: CalEvent;
  leads: Lead[];
  onSave: (data: any) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}) {
  const toLocalInput = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const defaultDate = initialDate || new Date();
  const defaultStart = () => {
    if (editEvent) return toLocalInput(editEvent.start_time);
    const d = new Date(defaultDate);
    d.setHours(10, 0, 0, 0);
    return toLocalInput(d.toISOString());
  };
  const defaultEnd = () => {
    if (editEvent) return toLocalInput(editEvent.end_time);
    const d = new Date(defaultDate);
    d.setHours(11, 0, 0, 0);
    return toLocalInput(d.toISOString());
  };

  const [title, setTitle] = React.useState(editEvent?.title || '');
  const [description, setDescription] = React.useState(editEvent?.description || '');
  const [location, setLocation] = React.useState(editEvent?.location || '');
  const [startTime, setStartTime] = React.useState(defaultStart);
  const [endTime, setEndTime] = React.useState(defaultEnd);
  const [eventType, setEventType] = React.useState<CalEvent['event_type']>(editEvent?.event_type || 'meeting');
  const [leadId, setLeadId] = React.useState(editEvent?.lead_id || '');
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);
  const [checkingConflicts, setCheckingConflicts] = React.useState(false);
  const [overrideConflict, setOverrideConflict] = React.useState(false);

  const checkConflicts = React.useCallback(async (start: string, end: string) => {
    if (!start || !end) return;
    setCheckingConflicts(true);
    try {
      const res = await fetch('/api/calendar/conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_time: new Date(start).toISOString(),
          end_time: new Date(end).toISOString(),
          exclude_id: editEvent?.id,
        }),
      });
      const data = await res.json();
      setConflicts(data.conflicts || []);
      setOverrideConflict(false);
    } finally {
      setCheckingConflicts(false);
    }
  }, [editEvent?.id]);

  // Debounce conflict check when times change
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (startTime && endTime) checkConflicts(startTime, endTime);
    }, 600);
    return () => clearTimeout(t);
  }, [startTime, endTime, checkConflicts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;
    if (conflicts.length > 0 && !overrideConflict) {
      setOverrideConflict(true);
      return;
    }
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        event_type: eventType,
        lead_id: leadId || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try { await onDelete(); onClose(); } finally { setDeleting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <p className="font-bold text-white text-sm">{editEvent ? 'Edit Event' : 'New Event'}</p>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Title */}
          <input
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Event title"
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 outline-none focus:border-emerald-500/40 transition-colors"
          />

          {/* Type pills */}
          <div className="flex gap-2 flex-wrap">
            {(['meeting', 'call', 'follow-up', 'other'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setEventType(t)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  eventType === t ? EVENT_COLORS[t] : 'border-white/[0.06] text-zinc-600 hover:text-zinc-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-1.5 block">Start</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-500/40 transition-colors"
              />
            </div>
            <div>
              <label className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-1.5 block">End</label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-500/40 transition-colors"
              />
            </div>
          </div>

          {/* Conflict warning */}
          {checkingConflicts && (
            <div className="flex items-center gap-2 text-[10px] text-zinc-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              Checking for conflicts...
            </div>
          )}
          {!checkingConflicts && conflicts.length > 0 && (
            <div className="bg-amber-500/[0.08] border border-amber-500/30 rounded-xl px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Time conflict detected</p>
              </div>
              {conflicts.map(c => (
                <p key={c.id} className="text-[11px] text-amber-200/70 leading-relaxed">
                  <span className="font-semibold">{c.title}</span>
                  {' — '}{fmtTime(c.start_time)} to {fmtTime(c.end_time)}
                </p>
              ))}
              {overrideConflict ? (
                <p className="text-[10px] text-amber-300 font-semibold">Click save again to schedule anyway.</p>
              ) : (
                <p className="text-[10px] text-amber-400/60">Click save to override, or adjust the time.</p>
              )}
            </div>
          )}

          {/* Lead link */}
          {leads.length > 0 && (
            <div>
              <label className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-1.5 block flex items-center gap-1.5">
                <Link2 className="h-3 w-3" /> Link to Lead
              </label>
              <select
                value={leadId}
                onChange={e => setLeadId(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-500/40 transition-colors"
              >
                <option value="">No lead linked</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.name}{l.company ? ` — ${l.company}` : ''}</option>
                ))}
              </select>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-1.5 block flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> Location
            </label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Zoom link, address, or phone..."
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-300 placeholder:text-zinc-700 outline-none focus:border-emerald-500/40 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-1.5 block flex items-center gap-1.5">
              <AlignLeft className="h-3 w-3" /> Notes
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Agenda, prep notes..."
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-300 placeholder:text-zinc-700 outline-none focus:border-emerald-500/40 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <div>
              {onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 text-[11px] text-red-500/70 hover:text-red-400 transition-colors disabled:opacity-40"
                >
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                {conflicts.length > 0 && overrideConflict ? 'Save Anyway' : 'Save Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Event Detail Panel ────────────────────────────────────────────────────────

function EventDetail({ event, onEdit, onClose }: { event: CalEvent; onEdit: () => void; onClose: () => void }) {
  const colorClass = EVENT_COLORS[event.source === 'google' ? 'google' : event.event_type] || EVENT_COLORS.other;
  return (
    <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${colorClass} inline-block mb-2`}>
            {event.source === 'google' ? 'Google' : event.event_type}
          </span>
          <p className="text-sm font-bold text-white leading-snug">{event.title}</p>
        </div>
        <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 text-[11px] text-zinc-500">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>{fmtDate(event.start_time)}, {fmtTime(event.start_time)} – {fmtTime(event.end_time)}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="break-all">{event.location}</span>
          </div>
        )}
        {event.leads && (
          <div className="flex items-center gap-2">
            <Link2 className="h-3 w-3 flex-shrink-0" />
            <span>{event.leads.name}{event.leads.company ? ` — ${event.leads.company}` : ''}</span>
          </div>
        )}
        {event.description && (
          <div className="flex items-start gap-2">
            <AlignLeft className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <span className="text-zinc-400 leading-relaxed">{event.description}</span>
          </div>
        )}
      </div>

      {event.source !== 'google' && (
        <button
          onClick={onEdit}
          className="w-full mt-2 py-2 text-xs font-semibold text-zinc-500 hover:text-white border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all"
        >
          Edit Event
        </button>
      )}
    </div>
  );
}

// ── Main Calendar Page ────────────────────────────────────────────────────────

export default function CalendarPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = React.useState<CalEvent[]>([]);
  const [googleEvents, setGoogleEvents] = React.useState<CalEvent[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [googleStatus, setGoogleStatus] = React.useState<{ configured: boolean; connected: boolean } | null>(null);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<CalEvent | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<CalEvent | undefined>();
  const [modalDate, setModalDate] = React.useState<Date | undefined>();

  // Handle Google OAuth return params
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected')) {
      window.history.replaceState({}, '', '/dashboard/calendar');
      fetchGoogleStatus();
      fetchGoogleEvents();
    }
    if (params.get('google_error')) {
      window.history.replaceState({}, '', '/dashboard/calendar');
    }
  }, []);

  const fetchGoogleStatus = async () => {
    const res = await fetch('/api/calendar/google/status');
    const data = await res.json();
    setGoogleStatus(data);
  };

  const fetchGoogleEvents = async () => {
    setGoogleLoading(true);
    try {
      const res = await fetch('/api/calendar/google/events');
      const data = await res.json();
      setGoogleEvents((data.events || []).map((e: any) => ({ ...e, source: 'google' })));
    } finally {
      setGoogleLoading(false);
    }
  };

  React.useEffect(() => {
    Promise.all([
      fetch('/api/calendar').then(r => r.json()),
      fetch('/api/leads').then(r => r.json()),
      fetchGoogleStatus(),
    ]).then(([calData, leadsData]) => {
      setEvents(calData.events || []);
      setLeads(leadsData.leads || []);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    if (googleStatus?.connected) fetchGoogleEvents();
  }, [googleStatus?.connected]);

  const allEvents = React.useMemo(
    () => [...events, ...googleEvents],
    [events, googleEvents]
  );

  const eventsOnDay = (day: Date) =>
    allEvents.filter(e => isSameDay(new Date(e.start_time), day));

  const grid = buildMonthGrid(currentDate.getFullYear(), currentDate.getMonth());

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const openCreate = (date?: Date) => {
    setEditingEvent(undefined);
    setModalDate(date);
    setShowModal(true);
  };

  const openEdit = (event: CalEvent) => {
    setEditingEvent(event);
    setModalDate(undefined);
    setShowModal(true);
    setSelectedEvent(null);
  };

  const handleSave = async (data: any) => {
    if (editingEvent) {
      const res = await fetch(`/api/calendar/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const { event } = await res.json();
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? event : e));
    } else {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const { event } = await res.json();
      setEvents(prev => [event, ...prev].sort((a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ));
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    await fetch(`/api/calendar/${editingEvent.id}`, { method: 'DELETE' });
    setEvents(prev => prev.filter(e => e.id !== editingEvent.id));
    if (selectedEvent?.id === editingEvent.id) setSelectedEvent(null);
  };

  const disconnectGoogle = async () => {
    await fetch('/api/calendar/google/status', { method: 'DELETE' });
    setGoogleStatus(s => s ? { ...s, connected: false } : null);
    setGoogleEvents([]);
  };

  // Upcoming events (next 30 days)
  const upcomingEvents = allEvents
    .filter(e => new Date(e.start_time) >= today)
    .slice(0, 8);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-1">Calendar</p>
          <h1 className="text-2xl font-black text-white">Schedule</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Google Calendar connect */}
          {googleStatus && (
            googleStatus.connected ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-zinc-400">Google Calendar synced</span>
                <button onClick={disconnectGoogle} className="text-[9px] text-zinc-600 hover:text-red-400 transition-colors ml-1">
                  Disconnect
                </button>
                <button onClick={fetchGoogleEvents} disabled={googleLoading} className="text-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-40">
                  <RefreshCcw className={`h-3 w-3 ${googleLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            ) : googleStatus.configured ? (
              <a
                href="/api/calendar/google/auth"
                className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] rounded-xl text-[10px] text-zinc-400 hover:text-white transition-all"
              >
                <ExternalLink className="h-3 w-3" />
                Connect Google Calendar
              </a>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-zinc-600">Google Calendar (not configured)</span>
              </div>
            )
          )}

          <button
            onClick={() => openCreate()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Month Calendar ── */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">

          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <button onClick={prevMonth} className="p-1.5 text-zinc-600 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-bold text-white">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </p>
            <button onClick={nextMonth} className="p-1.5 text-zinc-600 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/[0.06]">
            {DAY_NAMES.map(d => (
              <div key={d} className="py-2 text-center text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {grid.map((day, idx) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = isSameDay(day, today);
                const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                const dayEvents = eventsOnDay(day);
                const shown = dayEvents.slice(0, 2);
                const extra = dayEvents.length - shown.length;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedDay(day);
                      setSelectedEvent(null);
                    }}
                    className={`min-h-[80px] p-2 border-b border-r border-white/[0.04] cursor-pointer transition-all group ${
                      isSelected ? 'bg-emerald-500/[0.06]' : 'hover:bg-white/[0.02]'
                    } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                        isToday
                          ? 'bg-emerald-500 text-black'
                          : isCurrentMonth
                          ? 'text-zinc-300 group-hover:text-white'
                          : 'text-zinc-700'
                      }`}>
                        {day.getDate()}
                      </span>
                      {isCurrentMonth && (
                        <button
                          onClick={e => { e.stopPropagation(); openCreate(day); }}
                          className="opacity-0 group-hover:opacity-100 h-4 w-4 flex items-center justify-center text-zinc-600 hover:text-emerald-400 transition-all"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {shown.map(ev => (
                        <div
                          key={ev.id}
                          onClick={e => { e.stopPropagation(); setSelectedEvent(ev); setSelectedDay(day); }}
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border truncate cursor-pointer ${
                            EVENT_COLORS[ev.source === 'google' ? 'google' : ev.event_type]
                          }`}
                        >
                          {fmtTime(ev.start_time)} {ev.title}
                        </div>
                      ))}
                      {extra > 0 && (
                        <p className="text-[9px] text-zinc-600 px-1">+{extra} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        <div className="space-y-4">

          {/* Selected day events / event detail */}
          {selectedEvent ? (
            <EventDetail
              event={selectedEvent}
              onEdit={() => openEdit(selectedEvent)}
              onClose={() => setSelectedEvent(null)}
            />
          ) : selectedDay ? (
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-white">{fmtDate(selectedDay.toISOString())}</p>
                <button
                  onClick={() => openCreate(selectedDay)}
                  className="h-7 w-7 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {eventsOnDay(selectedDay).length === 0 ? (
                <p className="text-[11px] text-zinc-600 text-center py-4">No events — click + to add one</p>
              ) : (
                <div className="space-y-2">
                  {eventsOnDay(selectedDay).map(ev => (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${EVENT_COLORS[ev.source === 'google' ? 'google' : ev.event_type]}`}
                    >
                      <p className="text-[11px] font-semibold">{ev.title}</p>
                      <p className="text-[10px] opacity-70">{fmtTime(ev.start_time)} – {fmtTime(ev.end_time)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Upcoming events */}
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.15em] mb-4">Upcoming</p>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 text-zinc-600 animate-spin" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-8 w-8 text-zinc-800 mx-auto mb-2" />
                <p className="text-[11px] text-zinc-600">No upcoming events</p>
                <button onClick={() => openCreate()} className="mt-3 text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">
                  Schedule one →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map(ev => {
                  const isGcal = ev.source === 'google';
                  const dotClass = EVENT_DOT[isGcal ? 'google' : ev.event_type];
                  return (
                    <button
                      key={ev.id}
                      onClick={() => { setSelectedEvent(ev); setSelectedDay(new Date(ev.start_time)); }}
                      className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-all group"
                    >
                      <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${dotClass}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-zinc-300 truncate group-hover:text-white transition-colors">{ev.title}</p>
                        <p className="text-[10px] text-zinc-600">{fmtDate(ev.start_time)} · {fmtTime(ev.start_time)}</p>
                        {ev.leads && (
                          <p className="text-[9px] text-zinc-700">{ev.leads.name}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-4">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.15em] mb-3">Legend</p>
            <div className="space-y-1.5">
              {[
                { label: 'Meeting', key: 'meeting' },
                { label: 'Call', key: 'call' },
                { label: 'Follow-up', key: 'follow-up' },
                { label: 'Other', key: 'other' },
                { label: 'Google Calendar', key: 'google' },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${EVENT_DOT[key]}`} />
                  <span className="text-[10px] text-zinc-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Event Modal ── */}
      {showModal && (
        <EventModal
          initialDate={modalDate}
          editEvent={editingEvent}
          leads={leads}
          onSave={handleSave}
          onDelete={editingEvent ? handleDelete : undefined}
          onClose={() => { setShowModal(false); setEditingEvent(undefined); }}
        />
      )}
    </div>
  );
}
