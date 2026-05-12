import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Lock, Trophy, DollarSign, BarChart2, Zap, Flame, Medal, Star, Crown, CircleDollarSign, Send, Users, Target, Flag, CheckCircle2, Bell } from 'lucide-react'
import { FOUNDER_RANKS, XP_LEVELS, rankName, rankInfo } from '@/lib/founderos/engine'
import { BadgeCategoryDialog } from '@/components/strata/BadgeCategoryDialog'

interface Achievement {
  id: string
  title: string
  desc: string
  icon: string
  category: 'Revenue' | 'Outreach' | 'Pipeline' | 'Consistency' | 'Milestones'
  condition: string
}

const ACHIEVEMENTS: Achievement[] = [
  // Revenue — 15 badges
  { id: 'first_dollar', title: 'First Dollar', desc: 'Log your first revenue entry.', icon: '', category: 'Revenue', condition: 'Log 1 revenue period' },
  { id: 'profitable', title: 'In the Black', desc: 'Log a profitable period.', icon: '', category: 'Revenue', condition: 'Positive profit' },
  { id: 'revenue_1k', title: '$1K Spark', desc: 'Log $1,000 in one period.', icon: '', category: 'Revenue', condition: '$1,000 in a period' },
  { id: 'five_k', title: '$5K Month', desc: 'Record $5,000+ in one period.', icon: '', category: 'Revenue', condition: '$5,000 in a period' },
  { id: 'ten_k', title: '$10K Month', desc: 'Record $10,000+ in one period.', icon: '', category: 'Revenue', condition: '$10,000 in a period' },
  { id: 'revenue_25k', title: '$25K Breakout', desc: 'Record $25,000+ in one period.', icon: '', category: 'Revenue', condition: '$25,000 in a period' },
  { id: 'fifty_k', title: '$50K Month', desc: 'Record $50,000+ in one period.', icon: '', category: 'Revenue', condition: '$50,000 in a period' },
  { id: 'hundred_k', title: '$100K Month', desc: 'Record $100,000+ in one period.', icon: '', category: 'Revenue', condition: '$100,000 in a period' },
  { id: 'profit_10k', title: '$10K Profit', desc: 'Log $10,000 total profit.', icon: '', category: 'Revenue', condition: '$10,000 total profit' },
  { id: 'profit_50k', title: '$50K Profit', desc: 'Log $50,000 total profit.', icon: '', category: 'Revenue', condition: '$50,000 total profit' },
  { id: 'margin_50', title: '50% Margin', desc: 'Hit a 50%+ margin period.', icon: '', category: 'Revenue', condition: '50% margin' },
  { id: 'three_profit_periods', title: 'Profit Streak', desc: 'Log 3 profitable periods.', icon: '', category: 'Revenue', condition: '3 profitable periods' },
  { id: 'total_100k', title: '$100K Logged', desc: 'Log $100,000 total revenue.', icon: '', category: 'Revenue', condition: '$100K total revenue' },
  { id: 'total_500k', title: '$500K Logged', desc: 'Log $500,000 total revenue.', icon: '', category: 'Revenue', condition: '$500K total revenue' },
  { id: 'million_logged', title: 'Million Dollar Tracker', desc: 'Log $1,000,000 total revenue.', icon: '', category: 'Revenue', condition: '$1M total revenue' },

  // Outreach — 15 badges
  { id: 'first_dm', title: 'First Outreach', desc: 'Add your first outreach lead.', icon: '', category: 'Outreach', condition: '1 lead' },
  { id: 'five_dms', title: 'Warm Start', desc: 'Add 5 outreach leads.', icon: '', category: 'Outreach', condition: '5 leads' },
  { id: 'ten_dms', title: '10 Prospects', desc: 'Reach 10 prospects.', icon: '', category: 'Outreach', condition: '10 leads' },
  { id: 'twenty_five_dms', title: '25 Prospects', desc: 'Reach 25 prospects.', icon: '', category: 'Outreach', condition: '25 leads' },
  { id: 'outreach_machine', title: 'Outreach Machine', desc: 'Reach 50 prospects.', icon: '', category: 'Outreach', condition: '50 leads' },
  { id: 'hundred_dms', title: '100 Prospects', desc: 'Reach 100 prospects.', icon: '', category: 'Outreach', condition: '100 leads' },
  { id: 'two_fifty_dms', title: '250 Prospects', desc: 'Reach 250 prospects.', icon: '', category: 'Outreach', condition: '250 leads' },
  { id: 'outreach_500', title: '500 Prospect Army', desc: 'Reach 500 prospects.', icon: '', category: 'Outreach', condition: '500 leads' },
  { id: 'outreach_1000', title: '1K Outreach Club', desc: 'Reach 1,000 prospects.', icon: '', category: 'Outreach', condition: '1,000 leads' },
  { id: 'contacted_5', title: 'Follow-Up Five', desc: 'Move 5 leads into contacted.', icon: '', category: 'Outreach', condition: '5 contacted leads' },
  { id: 'contacted_25', title: 'Contact Engine', desc: 'Move 25 leads into contacted.', icon: '', category: 'Outreach', condition: '25 contacted leads' },
  { id: 'qualified_10', title: 'Qualification Loop', desc: 'Qualify 10 leads.', icon: '', category: 'Outreach', condition: '10 qualified leads' },
  { id: 'proposal_10', title: 'Proposal Push', desc: 'Send 10 proposals.', icon: '', category: 'Outreach', condition: '10 proposals' },
  { id: 'proposal_25', title: 'Proposal Machine', desc: 'Send 25 proposals.', icon: '', category: 'Outreach', condition: '25 proposals' },
  { id: 'pipeline_velocity', title: 'Velocity Builder', desc: 'Move 25 leads beyond new.', icon: '', category: 'Outreach', condition: '25 advanced leads' },

  // Pipeline — 15 badges
  { id: 'first_lead', title: 'First Lead', desc: 'Add your first lead.', icon: '', category: 'Pipeline', condition: '1 lead' },
  { id: 'ten_leads', title: 'Pipeline Builder', desc: 'Add 10 leads.', icon: '', category: 'Pipeline', condition: '10 leads' },
  { id: 'twenty_five_leads', title: 'Lead Machine', desc: 'Add 25 leads.', icon: '', category: 'Pipeline', condition: '25 leads' },
  { id: 'fifty_leads', title: 'Pipeline Factory', desc: 'Add 50 leads.', icon: '', category: 'Pipeline', condition: '50 leads' },
  { id: 'hundred_leads', title: 'Hundred Lead Stack', desc: 'Add 100 leads.', icon: '', category: 'Pipeline', condition: '100 leads' },
  { id: 'first_win', title: 'First Win', desc: 'Close your first deal.', icon: '', category: 'Pipeline', condition: '1 won deal' },
  { id: 'five_wins', title: 'Closer', desc: 'Close 5 deals.', icon: '', category: 'Pipeline', condition: '5 won deals' },
  { id: 'ten_wins', title: 'Deal Captain', desc: 'Close 10 deals.', icon: '', category: 'Pipeline', condition: '10 won deals' },
  { id: 'twenty_five_wins', title: '25 Deals Won', desc: 'Close 25 deals.', icon: '', category: 'Pipeline', condition: '25 won deals' },
  { id: 'fifty_wins', title: 'Revenue Engine', desc: 'Close 50 deals.', icon: '', category: 'Pipeline', condition: '50 won deals' },
  { id: 'hundred_wins', title: '100 Wins', desc: 'Close 100 deals.', icon: '', category: 'Pipeline', condition: '100 won deals' },
  { id: 'pipeline_10k', title: '$10K Pipeline', desc: 'Build a $10K pipeline.', icon: '', category: 'Pipeline', condition: '$10K pipeline value' },
  { id: 'pipeline_50k', title: '$50K Pipeline', desc: 'Build a $50K pipeline.', icon: '', category: 'Pipeline', condition: '$50K pipeline value' },
  { id: 'pipeline_100k', title: '$100K Pipeline', desc: 'Build a $100K pipeline.', icon: '', category: 'Pipeline', condition: '$100K pipeline value' },
  { id: 'pipeline_1m', title: '$1M Pipeline', desc: 'Build a $1M pipeline.', icon: '', category: 'Pipeline', condition: '$1M pipeline value' },

  // Consistency — 15 badges
  { id: 'login_streak_3', title: '3-Day Login', desc: 'Open FounderOS 3 days in a row.', icon: '', category: 'Consistency', condition: '3-day login streak' },
  { id: 'login_streak_7', title: '7-Day Login', desc: 'Open FounderOS 7 days in a row.', icon: '', category: 'Consistency', condition: '7-day login streak' },
  { id: 'login_streak_14', title: '14-Day Login', desc: 'Open FounderOS 14 days in a row.', icon: '', category: 'Consistency', condition: '14-day login streak' },
  { id: 'login_streak_30', title: '30-Day Login', desc: 'Open FounderOS 30 days in a row.', icon: '', category: 'Consistency', condition: '30-day login streak' },
  { id: 'login_streak_60', title: '60-Day Login', desc: 'Open FounderOS 60 days in a row.', icon: '', category: 'Consistency', condition: '60-day login streak' },
  { id: 'login_streak_100', title: '100-Day Login', desc: 'Open FounderOS 100 days in a row.', icon: '', category: 'Consistency', condition: '100-day login streak' },
  { id: 'task_streak_3', title: '3-Day Task Streak', desc: 'Complete tasks 3 days in a row.', icon: '', category: 'Consistency', condition: '3-day task streak' },
  { id: 'task_streak_7', title: '7-Day Task Streak', desc: 'Complete tasks 7 days in a row.', icon: '', category: 'Consistency', condition: '7-day task streak' },
  { id: 'task_streak_14', title: 'Two Week Operator', desc: 'Complete tasks 14 days in a row.', icon: '', category: 'Consistency', condition: '14-day task streak' },
  { id: 'task_streak_30', title: 'Monthly Machine', desc: 'Complete tasks 30 days in a row.', icon: '', category: 'Consistency', condition: '30-day task streak' },
  { id: 'daily_grind_10', title: '10 Tasks Done', desc: 'Complete 10 total tasks.', icon: '', category: 'Consistency', condition: '10 completed tasks' },
  { id: 'daily_grind_50', title: '50 Tasks Done', desc: 'Complete 50 total tasks.', icon: '', category: 'Consistency', condition: '50 completed tasks' },
  { id: 'daily_grind_100', title: '100 Tasks Done', desc: 'Complete 100 total tasks.', icon: '', category: 'Consistency', condition: '100 completed tasks' },
  { id: 'daily_grind_250', title: '250 Tasks Done', desc: 'Complete 250 total tasks.', icon: '', category: 'Consistency', condition: '250 completed tasks' },
  { id: 'twelve_periods', title: 'Full-Year Logger', desc: 'Log 12 business periods.', icon: '', category: 'Consistency', condition: '12 period entries' },

  // Milestones — 15 badges
  { id: 'workspace_created', title: 'Workspace Born', desc: 'Create your first workspace.', icon: '', category: 'Milestones', condition: 'Create workspace' },
  { id: 'workspace_second', title: 'Multi-Workspace', desc: 'Create 2 workspaces.', icon: '', category: 'Milestones', condition: '2 workspaces' },
  { id: 'calendar_entry', title: 'Daily Tracker', desc: 'Log your first daily P&L entry.', icon: '', category: 'Milestones', condition: '1 calendar entry' },
  { id: 'calendar_10', title: '10 Daily Logs', desc: 'Log 10 daily P&L entries.', icon: '', category: 'Milestones', condition: '10 calendar entries' },
  { id: 'calendar_30', title: '30 Daily Logs', desc: 'Log 30 daily P&L entries.', icon: '', category: 'Milestones', condition: '30 calendar entries' },
  { id: 'ai_copilot', title: 'AI Powered', desc: 'Activate your AI operating partner.', icon: '', category: 'Milestones', condition: 'AI enabled' },
  { id: 'team_first', title: 'First Teammate', desc: 'Add your first team member.', icon: '', category: 'Milestones', condition: '1 team member' },
  { id: 'team_5', title: 'Squad Builder', desc: 'Build a 5-person team.', icon: '', category: 'Milestones', condition: '5 team members' },
  { id: 'integration_first', title: 'First Integration', desc: 'Connect your first integration.', icon: '', category: 'Milestones', condition: '1 integration' },
  { id: 'integration_3', title: 'Connected Stack', desc: 'Connect 3 integrations.', icon: '', category: 'Milestones', condition: '3 integrations' },
  { id: 'username_set', title: 'Identity Claimed', desc: 'Set your FounderOS username.', icon: '', category: 'Milestones', condition: 'Set username' },
  { id: 'profile_photo', title: 'Profile Ready', desc: 'Add a profile picture.', icon: '', category: 'Milestones', condition: 'Upload avatar' },
  { id: 'first_report', title: 'CEO Report Opened', desc: 'Open your first CEO report.', icon: '', category: 'Milestones', condition: 'Open reports' },
  { id: 'notification_action', title: 'Inbox Operator', desc: 'Act on a notification.', icon: '', category: 'Milestones', condition: 'Use notifications' },
  { id: 'founder_os_ready', title: 'OS Activated', desc: 'Complete the core FounderOS setup loop.', icon: '', category: 'Milestones', condition: 'Workspace + task + lead + revenue' },
]

const CATEGORIES = ['Revenue', 'Outreach', 'Pipeline', 'Consistency', 'Milestones'] as const

function getXpLevel(xp: number) {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) if (xp >= XP_LEVELS[i]) return i + 1
  return 1
}
function xpProgress(xp: number) {
  const level = getXpLevel(xp)
  const floor = XP_LEVELS[level - 1] ?? 0
  const ceil  = XP_LEVELS[level]  ?? XP_LEVELS[XP_LEVELS.length - 1]
  return { level, xpInLevel: xp - floor, xpForNext: ceil - floor, totalXp: xp }
}

const RANKS = FOUNDER_RANKS.map((r, idx) => ({
  label: r.division ? `${r.base} ${r.division}` : r.base,
  minLevel: idx + 1,
  xpRange: idx + 1 < XP_LEVELS.length ? `${XP_LEVELS[idx].toLocaleString()} - ${(XP_LEVELS[idx + 1] - 1).toLocaleString()} XP` : `${XP_LEVELS[idx].toLocaleString()}+ XP`,
  cls: `rank-${r.base.toLowerCase()}`,
  solid: r.color,
  glow: `${r.color}55`,
  desc: idx === 0 ? 'Start the climb' : idx < 3 ? 'Build consistency' : idx < 9 ? 'Sharpen execution' : idx < 15 ? 'Scale momentum' : idx < 21 ? 'Elite founder discipline' : 'Top-tier operator',
}))


const BASE_RANKS = ['Rookie','Silver','Gold','Diamond','Elite','Founder'].map((base) => {
  const firstIdx = FOUNDER_RANKS.findIndex(r => r.base === base)
  const rank = FOUNDER_RANKS[firstIdx]
  const lastIdx = Math.max(firstIdx, FOUNDER_RANKS.map(r => r.base).lastIndexOf(base))
  const minXp = XP_LEVELS[firstIdx] || 0
  const maxXp = lastIdx + 1 < XP_LEVELS.length ? XP_LEVELS[lastIdx + 1] - 1 : XP_LEVELS[XP_LEVELS.length - 1]
  return {
    label: base,
    minLevel: firstIdx + 1,
    maxLevel: lastIdx + 1,
    xpRange: base === 'Radiant' ? `${minXp.toLocaleString()}+ XP` : `${minXp.toLocaleString()} - ${maxXp.toLocaleString()} XP`,
    solid: rank?.color || '#22c55e',
    desc: base === 'Rookie' ? 'Start the climb' : base === 'Silver' ? 'Sharpen execution' : base === 'Gold' ? 'Prove momentum' : base === 'Diamond' ? 'Elite discipline' : base === 'Elite' ? 'Dominant operator' : 'Top-tier founder',
  }
})

function getRankByLevel(level: number) {
  return RANKS[Math.max(0, Math.min(RANKS.length - 1, level - 1))] || RANKS[0]
}
function rankMotif(label: string, color: string, division = 1) {
  const glow = `${color}aa`
  if (label === 'Rookie') {
    return <><path d="M50 33 L57 47 L72 49 L61 60 L64 76 L50 68 L36 76 L39 60 L28 49 L43 47 Z" fill={color} stroke="rgba(255,255,255,.55)" strokeWidth="2" /><path d="M50 21 L50 89" stroke="rgba(255,255,255,.18)" strokeWidth="2" /></>
  }
  if (label === 'Silver') {
    return <><path d="M50 25 L66 52 L50 82 L34 52 Z" fill={color} stroke="rgba(255,255,255,.65)" strokeWidth="3" /><path d="M34 52 H66" stroke="rgba(255,255,255,.35)" strokeWidth="2" /><circle cx="50" cy="52" r="8" fill="rgba(0,0,0,.25)" stroke={glow} strokeWidth="2" /></>
  }
  if (label === 'Gold') {
    return <><path d="M50 26 L68 43 L61 76 H39 L32 43 Z" fill={color} stroke="rgba(255,255,255,.6)" strokeWidth="3" /><path d="M50 26 L50 76 M32 43 H68" stroke="rgba(0,0,0,.30)" strokeWidth="3" /><circle cx="50" cy="52" r="10" fill="rgba(255,255,255,.18)" /></>
  }
  if (label === 'Diamond') {
    return <><path d="M50 22 L73 45 L50 84 L27 45 Z" fill={color} stroke="rgba(255,255,255,.65)" strokeWidth="3" /><path d="M27 45 H73 M50 22 L41 45 L50 84 L59 45 Z" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="2" /></>
  }
  if (label === 'Elite') {
    return <><path d="M50 24 L69 35 L69 57 L50 82 L31 57 L31 35 Z" fill={color} stroke="rgba(255,255,255,.55)" strokeWidth="3" /><path d="M50 31 L59 51 L50 70 L41 51 Z" fill="rgba(255,255,255,.24)" /><path d="M31 57 H69" stroke="rgba(0,0,0,.25)" strokeWidth="3" /></>
  }
  return <><path d="M50 25 L58 42 L77 44 L63 57 L67 76 L50 66 L33 76 L37 57 L23 44 L42 42 Z" fill={color} stroke="rgba(255,255,255,.6)" strokeWidth="2.5" /><path d="M37 30 Q50 17 63 30" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" /><circle cx="50" cy="22" r="4" fill={color} /></>
}

function RankOrnaments({ color, division }: { color: string; division: number }) {
  return (
    <>
      {division >= 2 && (
        <>
          <path d="M18 48 L8 42 M82 48 L92 42" stroke={color} strokeWidth="3" strokeLinecap="round" opacity=".7" />
          <circle cx="18" cy="48" r="3" fill={color} opacity=".85" />
          <circle cx="82" cy="48" r="3" fill={color} opacity=".85" />
        </>
      )}
      {division >= 3 && (
        <>
          <path d="M27 91 Q50 104 73 91" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" opacity=".8" />
          <path d="M50 3 L54 12 L50 18 L46 12 Z" fill={color} stroke="rgba(255,255,255,.6)" strokeWidth="1.5" />
          <path d="M32 10 L36 17 M68 10 L64 17" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity=".75" />
        </>
      )}
    </>
  )
}

function RankBadge({ color, label, size = 76, active = true, division = 1 }: { color: string; label: string; size?: number; active?: boolean; division?: number }) {
  const gradId = `rank-shield-${label}-${size}`.replace(/\s+/g, '-')
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: active ? 1 : 0.42 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: `radial-gradient(circle at 50% 42%, ${color}55, transparent 64%)`, filter: 'blur(14px)' }} />
      <svg width={size} height={size} viewBox="0 0 100 110" style={{ position: 'relative', filter: active ? `drop-shadow(0 0 12px ${color}99)` : 'grayscale(1)' }}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="28%" stopColor={color} stopOpacity="0.95" />
            <stop offset="70%" stopColor={color} stopOpacity="0.55" />
            <stop offset="100%" stopColor="#050505" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <path d="M50 5 L87 21 L80 70 Q72 96 50 108 Q28 96 20 70 L13 21 Z" fill={active ? `url(#${gradId})` : 'rgba(255,255,255,.075)'} stroke={active ? color : 'rgba(255,255,255,.18)'} strokeWidth="4" />
        <path d="M50 15 L74 26 L69 66 Q64 83 50 93 Q36 83 31 66 L26 26 Z" fill="rgba(0,0,0,.28)" stroke="rgba(255,255,255,.16)" strokeWidth="2" />
        <path d="M24 24 L50 12 L76 24" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="2" />
        {rankMotif(label, active ? color : 'rgba(255,255,255,.22)', division)}
        <RankOrnaments color={active ? color : 'rgba(255,255,255,.20)'} division={division} />
        <path d="M30 72 Q50 90 70 72" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="2" />
      </svg>
    </div>
  )
}

function SmallBadge({ color, earned }: { color: string; earned: boolean }) {
  return (
    <div style={{ width: 28, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: earned ? 1 : .55 }}>
      <svg width="28" height="30" viewBox="0 0 100 110" style={{ filter: earned ? `drop-shadow(0 0 8px ${color}55)` : 'none' }}>
        <path d="M50 5 L84 19 L77 68 Q70 91 50 104 Q30 91 23 68 L16 19 Z" fill={earned ? `${color}22` : 'rgba(255,255,255,.04)'} stroke={earned ? color : 'rgba(255,255,255,.24)'} strokeWidth="6" />
        <path d="M50 29 L58 44 L75 46 L62 58 L66 76 L50 66 L34 76 L38 58 L25 46 L42 44 Z" fill={earned ? color : 'rgba(255,255,255,.16)'} stroke="rgba(255,255,255,.42)" strokeWidth="3" />
      </svg>
    </div>
  )
}


export default async function AchievementsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase.from('workspaces').select('name').eq('owner_id', user.id).maybeSingle()

  // All data queries in parallel
  const [
    { count: periodCount },
    { count: leadCount },
    { count: wonCount },
    { count: calCount },
    { data: leadRows },
    { data: periodEntries },
    { data: completedTasks },
    { data: calEntries },
    { data: userSettings },
    { data: gamRow },
    { count: workspaceCount },
    { count: teamCount },
    { count: integrationCount },
    { data: profileRow },
  ] = await Promise.all([
    supabase.from('period_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('pipeline_leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('pipeline_leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('stage', 'won'),
    supabase.from('cal_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('pipeline_leads').select('stage,status,value,deal_value').eq('user_id', user.id),
    supabase.from('period_entries').select('revenue, expenses, period_date').eq('user_id', user.id).order('period_date', { ascending: true }),
    supabase.from('tasks').select('completed_at').eq('user_id', user.id).eq('is_completed', true).not('completed_at', 'is', null),
    supabase.from('cal_entries').select('entry_date').eq('user_id', user.id),
    supabase.from('user_settings').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('user_gamification').select('total_xp, level, current_streak, longest_streak').eq('user_id', user.id).maybeSingle(),
    supabase.from('workspaces').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
    supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('integration_connections').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'connected'),
    supabase.from('profiles').select('username, avatar_url').eq('id', user.id).maybeSingle(),
  ])

  const totalXp = (gamRow as any)?.total_xp ?? 0
  const loginStreak = Math.max(Number((gamRow as any)?.current_streak) || 0, Number((gamRow as any)?.longest_streak) || 0)
  const xpProg  = xpProgress(totalXp)

  const pc = periodCount || 0
  const lc = leadCount || 0
  const wc = wonCount || 0
  const cc = calCount || 0
  const wsCount = workspaceCount || 0
  const tmCount = teamCount || 0
  const intCount = integrationCount || 0
  const pipelineValue = (leadRows || []).reduce((sum: number, l: any) => sum + (Number(l.value || l.deal_value) || 0), 0)
  const stageCount = (needle: string) => (leadRows || []).filter((l: any) => String(l.stage || l.status || '').toLowerCase().includes(needle)).length
  const contactedCount = stageCount('contact')
  const qualifiedCount = stageCount('qualif')
  const proposalCount = stageCount('proposal')
  const advancedCount = (leadRows || []).filter((l: any) => !String(l.stage || l.status || '').toLowerCase().includes('new')).length

  // Max revenue across all periods
  const maxRevenue = periodEntries?.length
    ? Math.max(...periodEntries.map(e => Number(e.revenue) || 0))
    : 0
  const totalRevenueLogged = (periodEntries || []).reduce((sum: number, e: any) => sum + (Number(e.revenue) || 0), 0)
  const totalProfitLogged = (periodEntries || []).reduce((sum: number, e: any) => sum + ((Number(e.revenue) || 0) - (Number(e.expenses) || 0)), 0)
  const profitablePeriods = (periodEntries || []).filter((e: any) => (Number(e.revenue) || 0) > (Number(e.expenses) || 0)).length
  const bestMargin = (periodEntries || []).reduce((best: number, e: any) => {
    const rev = Number(e.revenue) || 0
    const exp = Number(e.expenses) || 0
    return rev > 0 ? Math.max(best, ((rev - exp) / rev) * 100) : best
  }, 0)

  // Task streak
  let taskStreak = 0
  if (completedTasks && completedTasks.length > 0) {
    const days = new Set(completedTasks.map((t: any) => t.completed_at.split('T')[0]))
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      if (days.has(d.toISOString().split('T')[0])) taskStreak++
      else if (i > 0) break
    }
  }

  // Achievements earned from real app data. These are intentionally output-based.
  const earned = new Set<string>()
  if (pc >= 1) earned.add('first_dollar')
  if (profitablePeriods >= 1) earned.add('profitable')
  if (maxRevenue >= 1000) earned.add('revenue_1k')
  if (maxRevenue >= 5000) earned.add('five_k')
  if (maxRevenue >= 10000) earned.add('ten_k')
  if (maxRevenue >= 25000) earned.add('revenue_25k')
  if (maxRevenue >= 50000) earned.add('fifty_k')
  if (maxRevenue >= 100000) earned.add('hundred_k')
  if (totalProfitLogged >= 10000) earned.add('profit_10k')
  if (totalProfitLogged >= 50000) earned.add('profit_50k')
  if (bestMargin >= 50) earned.add('margin_50')
  if (profitablePeriods >= 3) earned.add('three_profit_periods')
  if (totalRevenueLogged >= 100000) earned.add('total_100k')
  if (totalRevenueLogged >= 500000) earned.add('total_500k')
  if (totalRevenueLogged >= 1000000) earned.add('million_logged')

  if (lc >= 1) earned.add('first_dm')
  if (lc >= 5) earned.add('five_dms')
  if (lc >= 10) earned.add('ten_dms')
  if (lc >= 25) earned.add('twenty_five_dms')
  if (lc >= 50) earned.add('outreach_machine')
  if (lc >= 100) earned.add('hundred_dms')
  if (lc >= 250) earned.add('two_fifty_dms')
  if (lc >= 500) earned.add('outreach_500')
  if (lc >= 1000) earned.add('outreach_1000')
  if (contactedCount >= 5) earned.add('contacted_5')
  if (contactedCount >= 25) earned.add('contacted_25')
  if (qualifiedCount >= 10) earned.add('qualified_10')
  if (proposalCount >= 10) earned.add('proposal_10')
  if (proposalCount >= 25) earned.add('proposal_25')
  if (advancedCount >= 25) earned.add('pipeline_velocity')

  if (lc >= 1) earned.add('first_lead')
  if (lc >= 10) earned.add('ten_leads')
  if (lc >= 25) earned.add('twenty_five_leads')
  if (lc >= 50) earned.add('fifty_leads')
  if (lc >= 100) earned.add('hundred_leads')
  if (wc >= 1) earned.add('first_win')
  if (wc >= 5) earned.add('five_wins')
  if (wc >= 10) earned.add('ten_wins')
  if (wc >= 25) earned.add('twenty_five_wins')
  if (wc >= 50) earned.add('fifty_wins')
  if (wc >= 100) earned.add('hundred_wins')
  if (pipelineValue >= 10000) earned.add('pipeline_10k')
  if (pipelineValue >= 50000) earned.add('pipeline_50k')
  if (pipelineValue >= 100000) earned.add('pipeline_100k')
  if (pipelineValue >= 1000000) earned.add('pipeline_1m')

  const completedTaskCount = completedTasks?.length || 0
  if (loginStreak >= 3) earned.add('login_streak_3')
  if (loginStreak >= 7) earned.add('login_streak_7')
  if (loginStreak >= 14) earned.add('login_streak_14')
  if (loginStreak >= 30) earned.add('login_streak_30')
  if (loginStreak >= 60) earned.add('login_streak_60')
  if (loginStreak >= 100) earned.add('login_streak_100')
  if (taskStreak >= 3) earned.add('task_streak_3')
  if (taskStreak >= 7) earned.add('task_streak_7')
  if (taskStreak >= 14) earned.add('task_streak_14')
  if (taskStreak >= 30) earned.add('task_streak_30')
  if (completedTaskCount >= 10) earned.add('daily_grind_10')
  if (completedTaskCount >= 50) earned.add('daily_grind_50')
  if (completedTaskCount >= 100) earned.add('daily_grind_100')
  if (completedTaskCount >= 250) earned.add('daily_grind_250')
  if (pc >= 12) earned.add('twelve_periods')

  if (workspace) earned.add('workspace_created')
  if (wsCount >= 2) earned.add('workspace_second')
  if (cc >= 1) earned.add('calendar_entry')
  if (cc >= 10) earned.add('calendar_10')
  if (cc >= 30) earned.add('calendar_30')
  if (userSettings) earned.add('ai_copilot')
  if (tmCount >= 1) earned.add('team_first')
  if (tmCount >= 5) earned.add('team_5')
  if (intCount >= 1) earned.add('integration_first')
  if (intCount >= 3) earned.add('integration_3')
  if ((profileRow as any)?.username) earned.add('username_set')
  if ((profileRow as any)?.avatar_url || user.user_metadata?.avatar_url) earned.add('profile_photo')
  if (pc >= 1 && lc >= 1 && workspace) earned.add('founder_os_ready')

  const totalEarned = ACHIEVEMENTS.filter(a => earned.has(a.id)).length

  // ── OVR Score (0–100) ──────────────────────────────────────────────────────
  // Revenue growth (25 pts): based on MoM improvement
  let revScore = 0
  if (periodEntries && periodEntries.length >= 2) {
    const prev = Number(periodEntries[periodEntries.length - 2]?.revenue) || 0
    const curr = Number(periodEntries[periodEntries.length - 1]?.revenue) || 0
    if (prev > 0) {
      const growth = ((curr - prev) / prev) * 100
      revScore = Math.min(25, Math.max(0, Math.round(growth * 0.5 + 12)))
    } else if (curr > 0) {
      revScore = 12
    }
  } else if (pc >= 1) {
    revScore = 8
  }

  // Margin health (20 pts)
  let marginScore = 0
  if (periodEntries && periodEntries.length > 0) {
    const latest = periodEntries[periodEntries.length - 1]
    const rev = Number(latest.revenue) || 0
    const exp = Number(latest.expenses) || 0
    const margin = rev > 0 ? ((rev - exp) / rev) * 100 : 0
    marginScore = Math.min(20, Math.max(0, Math.round(margin * 0.4)))
  }

  // Pipeline activity (20 pts)
  const pipeScore = Math.min(20, Math.round((lc / 10) * 12) + Math.round((wc / 5) * 8))

  // Consistency (20 pts): period entries + task streak
  const consistScore = Math.min(20, Math.round((Math.min(pc, 12) / 12) * 12) + Math.round((Math.min(taskStreak, 30) / 30) * 8))

  // Achievement bonus (15 pts)
  const achScore = Math.round((totalEarned / ACHIEVEMENTS.length) * 15)

  // OVR is now tied directly to the unified rank ladder.
  // It starts low at Rookie I and reaches 100 only at Founder III.
  const maxRankLevel = FOUNDER_RANKS.length
  const ovr = Math.min(100, Math.max(1, Math.round((xpProg.level / maxRankLevel) * 100)))
  const rank = getRankByLevel(xpProg.level)

  // ── Activity heatmap (12 weeks × 7 days) ─────────────────────────────────
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const heatmapDays: { date: string; count: number }[] = []

  // Build set of active dates from cal_entries and completed tasks
  const activityMap = new Map<string, number>()

  calEntries?.forEach((e: any) => {
    const d = e.entry_date?.split('T')[0]
    if (d) activityMap.set(d, (activityMap.get(d) || 0) + 1)
  })
  completedTasks?.forEach((t: any) => {
    const d = t.completed_at?.split('T')[0]
    if (d) activityMap.set(d, (activityMap.get(d) || 0) + 1)
  })

  // 84 days = 12 weeks, starting from Monday
  const msPerDay = 86400000
  // Find the Monday 12 weeks ago
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon, ...
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const startMonday = new Date(today.getTime() - (mondayOffset + 77) * msPerDay)

  for (let i = 0; i < 84; i++) {
    const d = new Date(startMonday.getTime() + i * msPerDay)
    const key = d.toISOString().split('T')[0]
    heatmapDays.push({ date: key, count: activityMap.get(key) || 0 })
  }

  // Organize into 12 columns of 7 days
  const heatWeeks: { date: string; count: number }[][] = []
  for (let w = 0; w < 12; w++) {
    heatWeeks.push(heatmapDays.slice(w * 7, w * 7 + 7))
  }

  const heatClass = (count: number) => {
    if (count === 0) return 'heat-0'
    if (count === 1) return 'heat-1'
    if (count <= 3) return 'heat-2'
    return 'heat-3'
  }

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const MONTH_ABBR = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  const heatLabel1 = MONTH_ABBR[startMonday.getMonth()]
  const heatLabel2 = MONTH_ABBR[new Date(startMonday.getTime() + 28 * msPerDay).getMonth()]
  const heatLabel3 = MONTH_ABBR[new Date(startMonday.getTime() + 56 * msPerDay).getMonth()]

  const scoreCards = [
    { label: 'Revenue Score', val: revScore, max: 25, Icon: DollarSign },
    { label: 'Outreach Score', val: marginScore, max: 20, Icon: Send },
    { label: 'Pipeline Score', val: pipeScore, max: 20, Icon: Users },
    { label: 'Streak Score', val: consistScore, max: 20, Icon: Flame },
    { label: 'Badge Score', val: achScore, max: 15, Icon: Medal },
  ]

  const badgeColors: Record<string, string> = {
    Revenue: '#22c55e', Outreach: '#22c55e', Pipeline: '#22c55e', Consistency: '#3b82f6', Milestones: '#22c55e'
  }

  const badgeSub: Record<string, string> = {
    first_dollar: 'Common · +50 XP', profitable: 'Common · +50 XP', five_k: 'Rare', ten_k: 'Epic', fifty_k: 'Legendary', hundred_k: 'Legendary', million_logged: 'Legendary',
    first_dm: 'Common · +50 XP', ten_dms: 'Uncommon', twenty_five_dms: 'Rare', outreach_machine: 'Epic', hundred_dms: 'Epic', two_fifty_dms: 'Legendary',
    first_lead: 'Common · +50 XP', ten_leads: 'Uncommon', twenty_five_leads: 'Rare', fifty_leads: 'Epic', first_win: 'Uncommon', five_wins: 'Rare', ten_wins: 'Epic', twenty_five_wins: 'Legendary', fifty_wins: 'Legendary',
    three_periods: 'Uncommon', six_periods: 'Rare', twelve_periods: 'Epic', task_streak_7: 'Rare', login_streak_3: 'Uncommon', login_streak_7: 'Rare', login_streak_30: 'Epic', login_streak_100: 'Legendary', task_streak_14: 'Epic', task_streak_30: 'Legendary', daily_grind_50: 'Epic', daily_grind_100: 'Legendary',
    workspace_created: 'Common · +50 XP', ai_copilot: 'Common · +50 XP', calendar_entry: 'Common', workspace_invite: 'Uncommon', workspace_switcher: 'Rare', integration_requested: 'Uncommon',
  }

  const displayName = (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Akhil'
  const prettyDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
  const prettyTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const prettyDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()

  return (
    <div className="min-h-full" style={{ background: '#050607', color: '#f7f7f7' }}>
      <style>{`
        .rank-preview-card, .achievement-hover-row { transition: transform .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease, opacity .18s ease; }
        .rank-preview-card:hover { transform: translateY(-4px) scale(1.015); opacity: 1 !important; box-shadow: 0 18px 55px rgba(0,0,0,.35), inset 0 0 32px rgba(34,197,94,.055) !important; }
        .achievement-hover-row:hover { transform: translateX(4px); background: rgba(34,197,94,.055) !important; border-color: rgba(34,197,94,.18) !important; }
        .rank-preview-card:hover .rank-hover-note { opacity: 1 !important; }
      `}</style>
      <div className="px-6 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,.035)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontSize: 22, lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.045em', color: '#f6f6f6' }}>Good afternoon, {displayName}</h1>
            <div className="mt-3 flex items-center gap-2">
              {[prettyDate, prettyTime, prettyDay].map((pill) => (
                <div key={pill} style={{ height: 28, minWidth: 78, padding: '0 15px', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.025))', border: '1px solid rgba(255,255,255,.07)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.035)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.78)' }}>{pill}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 pr-1" style={{ color: 'rgba(255,255,255,.66)' }}>
            <div className="relative">
              <Bell style={{ width: 18, height: 18, color: 'rgba(255,255,255,.72)' }} />
              <span style={{ position: 'absolute', right: -7, top: -7, width: 15, height: 15, borderRadius: 99, background: '#22c55e', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Log out</span>
            <div style={{ width: 28, height: 28, borderRadius: 99, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.025)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: 14, height: 14, color: 'rgba(255,255,255,.75)' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4" style={{ width: '100%', maxWidth: 'none' }}>
        <div className="grid gap-3" style={{ gridTemplateColumns: '286px 1fr' }}>
          <div className="panel-card p-6" style={{ minHeight: 226 }}>
            <p className="kicker">Current Rank</p>
            <h2 className="mt-4" style={{ fontSize: 31, lineHeight: 1, fontWeight: 850, letterSpacing: '-.045em', color: '#fff' }}>{rank.label}</h2>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)' }}>{rank.desc}</p>
              <RankBadge color={rank.solid} label={rankInfo(xpProg.level).base} size={82} active division={((xpProg.level - 1) % 3) + 1} />
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span style={{ fontSize: 43, lineHeight: 1, fontWeight: 900, letterSpacing: '-.06em', color: '#22c55e' }}>{ovr}</span>
              <span style={{ marginBottom: 7, fontSize: 12, fontWeight: 800, color: '#22c55e' }}>OVR</span>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden" style={{ borderRadius: 99, background: 'rgba(255,255,255,.085)' }}>
              <div className="h-full" style={{ width: `${Math.min(100, Math.round((xpProg.xpInLevel / Math.max(1, xpProg.xpForNext)) * 100))}%`, borderRadius: 99, background: '#22c55e', boxShadow: '0 0 14px rgba(34,197,94,.5)' }} />
            </div>
            <div className="mt-3 flex items-center justify-between" style={{ fontSize: 12 }}>
              <span style={{ color: 'rgba(255,255,255,.62)' }}>{xpProg.xpInLevel.toLocaleString()} / {xpProg.xpForNext.toLocaleString()} XP</span>
              <span style={{ color: '#22c55e', fontWeight: 800 }}>{rank.label}</span>
            </div>
          </div>

          <div className="panel-card p-4" style={{ minHeight: 226 }}>
            <p className="kicker mb-3">Rank Progression</p>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
              {BASE_RANKS.map((r) => {
                const currentBase = rankInfo(xpProg.level).base
                const isCurrent = currentBase === r.label
                const active = xpProg.level >= r.minLevel
                return (
                  <div key={r.label} title={`Preview ${r.label} rank`} className="rank-preview-card relative flex flex-col items-center justify-between" style={{ minHeight: 184, padding: '18px 12px 18px', borderRadius: 9, background: 'linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.012))', border: `1px solid ${isCurrent ? '#22c55e' : r.solid}`, opacity: active || isCurrent ? 1 : .58, boxShadow: isCurrent ? '0 0 0 1px rgba(34,197,94,.18), inset 0 0 26px rgba(34,197,94,.045)' : 'inset 0 1px 0 rgba(255,255,255,.025)' }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{r.label}</p>
                    <RankBadge color={r.solid} label={r.label} size={102} active={true} division={isCurrent ? ((xpProg.level - 1) % 3) + 1 : 3} />
                    <div className="text-center" style={{ lineHeight: 1.55 }}>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,.58)' }}>{r.xpRange}</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,.58)' }}>Levels {r.minLevel}{r.maxLevel !== r.minLevel ? `-${r.maxLevel}` : ''}</p><p className="rank-hover-note" style={{ fontSize: 9, color: r.solid, opacity: 0, fontWeight: 800 }}>Hover preview</p>
                    </div>
                    {isCurrent && <div style={{ position: 'absolute', bottom: -5, width: 8, height: 8, borderRadius: 99, background: '#22c55e', boxShadow: '0 0 14px #22c55e' }} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-3 mt-3" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
          {scoreCards.map((s) => (
            <div key={s.label} className="panel-card p-4" style={{ minHeight: 100 }}>
              <p className="kicker">{s.label}</p>
              <div className="mt-3 flex items-end gap-2">
                <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 850, letterSpacing: '-.05em', color: '#fff' }}>{s.val}</span>
                <span style={{ marginBottom: 3, fontSize: 12, color: 'rgba(255,255,255,.48)' }}>/{s.max}</span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden" style={{ borderRadius: 99, background: 'rgba(255,255,255,.075)' }}>
                <div className="h-full" style={{ width: `${Math.min(100, Math.round((s.val / Math.max(1, s.max)) * 100))}%`, borderRadius: 99, background: '#22c55e' }} />
              </div>
            </div>
          ))}
          <div className="panel-card p-4" style={{ minHeight: 100, borderLeft: '1px solid rgba(255,255,255,.10)' }}>
            <p className="kicker">Total Badges</p>
            <div className="mt-3 flex items-end gap-2">
              <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 850, color: '#fff' }}>{totalEarned}</span>
              <span style={{ marginBottom: 3, fontSize: 12, color: 'rgba(255,255,255,.48)' }}>/{ACHIEVEMENTS.length}</span>
            </div>
            <Trophy className="mt-2" style={{ width: 18, height: 18, color: 'rgba(255,255,255,.42)' }} />
          </div>
        </div>

        <div className="panel-card mt-3 p-4" style={{ minHeight: 210 }}>
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 style={{ fontSize: 16, lineHeight: 1.15, fontWeight: 800, color: '#fff' }}>Activity Heatmap</h3>
              <p style={{ marginTop: 3, fontSize: 12, color: 'rgba(255,255,255,.50)' }}>{activityMap.size} active day{activityMap.size === 1 ? '' : 's'} in the last 12 weeks</p>
            </div>
            <div className="flex items-center gap-1.5 pr-2">
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.48)' }}>Less</span>
              {['rgba(255,255,255,.055)', 'rgba(34,197,94,.22)', 'rgba(34,197,94,.5)', '#22c55e'].map(c => <div key={c} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />)}
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.48)' }}>More</span>
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="flex gap-1" style={{ width: '100%' }}>
              <div className="mr-2 flex flex-col gap-1">
                {dayLabels.map((d, i) => <div key={i} style={{ height: 13, display: 'flex', alignItems: 'center' }}><span style={{ fontSize: 10, color: 'rgba(255,255,255,.55)' }}>{d}</span></div>)}
              </div>
              {heatWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-1 flex-col gap-1">
                  {week.map((day) => <div key={day.date} className={heatClass(day.count)} title={`${day.date}: ${day.count} actions`} style={{ height: 13, width: '100%', minWidth: 16, borderRadius: 3 }} />)}
                </div>
              ))}
            </div>
            <div className="mt-2 grid" style={{ marginLeft: 190, gridTemplateColumns: '1fr 1fr 1fr', fontSize: 11, color: 'rgba(255,255,255,.44)', width: 'calc(100% - 190px)' }}>
              <span>{heatLabel1}</span><span>{heatLabel2}</span><span>{heatLabel3}</span>
            </div>
          </div>
        </div>

        <div className="panel-card mt-3 p-4">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h2 style={{ fontSize: 18, lineHeight: 1.1, fontWeight: 850, letterSpacing: '-.035em', color: '#fff' }}>Trophy Room</h2>
              <p style={{ marginTop: 4, fontSize: 11, color: 'rgba(255,255,255,.50)' }}>We do not reward participation. We reward output.</p>
            </div>
            <div className="text-right">
              <p className="kicker">Completion</p>
              <p style={{ fontSize: 22, lineHeight: 1, fontWeight: 900, color: '#22c55e' }}>{totalEarned}<span style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,.65)' }}>/{ACHIEVEMENTS.length}</span></p>
            </div>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
            {CATEGORIES.map((cat) => {
              const items = ACHIEVEMENTS.filter(a => a.category === cat)
              const catEarned = items.filter(a => earned.has(a.id)).length
              const color = badgeColors[cat]
              const HeaderIcon = cat === 'Revenue' ? CircleDollarSign : cat === 'Outreach' ? Send : cat === 'Pipeline' ? Users : cat === 'Consistency' ? Target : Flag
              return (
                <div key={cat} style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,.08)', background: 'linear-gradient(180deg, rgba(255,255,255,.035), rgba(8,8,8,.70))', overflow: 'hidden', minHeight: 0 }}>
                  <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,.055)' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div style={{ width: 24, height: 24, borderRadius: 99, border: '1px solid rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <HeaderIcon style={{ width: 13, height: 13, color: 'rgba(255,255,255,.75)' }} />
                      </div>
                      <p className="truncate" style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{cat}</p>
                    </div>
                    <div className="flex items-center gap-2"><span style={{ fontSize: 11, fontWeight: 800, color, whiteSpace: 'nowrap' }}>{catEarned} <span style={{ color: 'rgba(255,255,255,.52)' }}>/ {items.length} earned</span></span><BadgeCategoryDialog category={cat} items={items} earnedIds={[...earned]} badgeSub={badgeSub} accent={color} /></div>
                  </div>
                  <div style={{ maxHeight: 182, overflowY: 'auto' }}>
                    {items.map(a => {
                      const isEarned = earned.has(a.id)
                      const sub = badgeSub[a.id] || 'Common'
                      const rarityColor = sub.includes('Legendary') ? '#f6c343' : sub.includes('Epic') ? '#bf5af2' : sub.includes('Rare') ? '#3b82f6' : sub.includes('Uncommon') ? '#22c55e' : '#22c55e'
                      return (
                        <div key={a.id} className="achievement-hover-row flex items-center gap-2 px-3 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,.04)', borderLeft: '1px solid transparent', cursor: 'default' }} title={`${a.title}: ${sub}` }>
                          <SmallBadge color={rarityColor} earned={isEarned} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="truncate" style={{ fontSize: 11, fontWeight: 700, color: isEarned ? '#fff' : 'rgba(255,255,255,.62)' }}>{a.title}</p>
                              <span style={{ fontSize: 9, color: rarityColor, whiteSpace: 'nowrap' }}>{sub}</span>
                            </div>
                          </div>
                          {isEarned ? <CheckCircle2 style={{ width: 15, height: 15, color: '#22c55e', flexShrink: 0 }} /> : <Lock style={{ width: 14, height: 14, color: 'rgba(255,255,255,.42)', flexShrink: 0 }} />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        
      </div>
    </div>
  )}
