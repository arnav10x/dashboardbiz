export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface AchievementDef {
  name: string;
  description: string;
  category: string;
  badge_image_url: string;
  rarity: Rarity;
  xp: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  // ── Revenue ──────────────────────────────────────────────────────────────
  { name: 'First Dollar',    description: 'Log your first revenue entry.',              category: 'Revenue',     badge_image_url: '💰', rarity: 'common',    xp: 50  },
  { name: 'In the Black',    description: 'Log a period with positive profit margin.',  category: 'Revenue',     badge_image_url: '📈', rarity: 'common',    xp: 50  },
  { name: '$5K Month',       description: 'Hit $5,000 revenue in a single period.',     category: 'Revenue',     badge_image_url: '💵', rarity: 'rare',      xp: 150 },
  { name: '$10K Month',      description: 'Hit $10,000 revenue in a single period.',    category: 'Revenue',     badge_image_url: '🤑', rarity: 'epic',      xp: 300 },
  { name: '$50K Month',      description: 'Hit $50,000 revenue in a single period.',    category: 'Revenue',     badge_image_url: '🏦', rarity: 'legendary', xp: 1000 },

  // ── Outreach ─────────────────────────────────────────────────────────────
  { name: 'First Contact',   description: 'Send your very first DM.',                  category: 'Outreach',    badge_image_url: '🚀', rarity: 'common',    xp: 50  },
  { name: 'Century',         description: 'Send 100 total outbound messages.',          category: 'Outreach',    badge_image_url: '💯', rarity: 'uncommon',  xp: 100 },
  { name: 'War Dialer',      description: 'Send 500 total DMs.',                        category: 'Outreach',    badge_image_url: '⚔️', rarity: 'rare',      xp: 200 },
  { name: 'Relentless',      description: 'Hit your daily outreach target 7 days in a row.', category: 'Outreach', badge_image_url: '🔥', rarity: 'epic',   xp: 500 },

  // ── Pipeline ─────────────────────────────────────────────────────────────
  { name: 'First Lead',      description: 'Add your first lead to the pipeline.',       category: 'Pipeline',    badge_image_url: '🎯', rarity: 'common',    xp: 50  },
  { name: 'Pipeline Builder',description: 'Add 10 leads to your pipeline.',             category: 'Pipeline',    badge_image_url: '⚡', rarity: 'uncommon',  xp: 100 },
  { name: 'First Win',       description: 'Close your first client.',                   category: 'Pipeline',    badge_image_url: '🥉', rarity: 'uncommon',  xp: 100 },
  { name: 'Closer',          description: 'Close 5 clients.',                           category: 'Pipeline',    badge_image_url: '🏆', rarity: 'rare',      xp: 200 },

  // ── Consistency ──────────────────────────────────────────────────────────
  { name: 'Day 7',           description: 'Complete Week 1 of the Founder OS Roadmap.', category: 'Consistency', badge_image_url: '7️⃣', rarity: 'common',   xp: 50  },
  { name: 'Halfway',         description: 'Reach Day 15 — the point of no return.',    category: 'Consistency', badge_image_url: '🌗', rarity: 'uncommon',  xp: 100 },
  { name: 'Locked In',       description: 'Log activity for 14 consecutive days.',      category: 'Consistency', badge_image_url: '🔒', rarity: 'rare',      xp: 200 },
  { name: 'Finisher',        description: 'Complete all 30 days of the Roadmap.',       category: 'Consistency', badge_image_url: '👑', rarity: 'legendary', xp: 1000 },

  // ── Performance ──────────────────────────────────────────────────────────
  { name: 'Three-Peat',      description: 'Close 3 paying clients.',                    category: 'Performance', badge_image_url: '🤝', rarity: 'rare',      xp: 200 },
  { name: 'Sharp Shooter',   description: 'Maintain a 10%+ reply rate for a full week.',category: 'Performance', badge_image_url: '🎖️', rarity: 'rare',     xp: 150 },
  { name: 'Converter',       description: 'Reach a 20%+ call-to-close rate.',           category: 'Performance', badge_image_url: '📊', rarity: 'epic',      xp: 300 },

  // ── Revenue (new) ─────────────────────────────────────────────────────────
  { name: '$1K Month',       description: 'Hit $1,000 in revenue.',                     category: 'Revenue',     badge_image_url: '💸', rarity: 'uncommon',  xp: 100 },
  { name: '$100K Month',     description: 'Hit $100,000 in revenue. Legendary territory.', category: 'Revenue', badge_image_url: '🦁', rarity: 'legendary', xp: 2000 },

  // ── Outreach (new) ────────────────────────────────────────────────────────
  { name: 'Icebreaker',      description: 'Send 10 DMs in a single day.',               category: 'Outreach',    badge_image_url: '🧊', rarity: 'common',    xp: 50  },
  { name: 'Volume King',     description: 'Send 50 DMs in a single week.',              category: 'Outreach',    badge_image_url: '⚡', rarity: 'uncommon',  xp: 100 },
  { name: '1K Club',         description: 'Send 1,000 total DMs.',                      category: 'Outreach',    badge_image_url: '🎰', rarity: 'epic',      xp: 500 },

  // ── Pipeline (new) ────────────────────────────────────────────────────────
  { name: 'Network Effect',  description: 'Build a pipeline of 25+ leads.',             category: 'Pipeline',    badge_image_url: '🕸️', rarity: 'uncommon',  xp: 100 },
  { name: 'Deal Machine',    description: 'Close 10 total clients.',                    category: 'Pipeline',    badge_image_url: '🤖', rarity: 'epic',      xp: 400 },
  { name: 'High Ticket',     description: 'Close a client for $5,000 or more.',         category: 'Pipeline',    badge_image_url: '💎', rarity: 'legendary', xp: 800 },

  // ── Consistency (new) ─────────────────────────────────────────────────────
  { name: 'Day 1',           description: 'Begin your 30-day sprint.',                  category: 'Consistency', badge_image_url: '🌱', rarity: 'common',    xp: 25  },
  { name: 'Three Weeks',     description: 'Reach Day 21 of the Roadmap.',              category: 'Consistency', badge_image_url: '📅', rarity: 'uncommon',  xp: 150 },
  { name: 'Streak Week',     description: 'Log activity 7 days in a row.',              category: 'Consistency', badge_image_url: '🗓️', rarity: 'uncommon',  xp: 100 },

  // ── Performance (new) ─────────────────────────────────────────────────────
  { name: 'Reply Machine',   description: 'Receive 25 replies from cold prospects.',    category: 'Performance', badge_image_url: '💬', rarity: 'uncommon',  xp: 100 },
  { name: 'Call King',       description: 'Book 20 sales calls.',                       category: 'Performance', badge_image_url: '📞', rarity: 'rare',      xp: 200 },
  { name: 'The 1%',          description: 'Maintain a 30%+ close rate for a week.',     category: 'Performance', badge_image_url: '🏅', rarity: 'epic',      xp: 500 },
];

export async function ensureAchievementsSeeded(supabase: any) {
  try {
    const { data: existing } = await supabase.from('achievements').select('name');
    const existingNames = new Set((existing || []).map((a: any) => a.name));
    const toInsert = ACHIEVEMENT_DEFINITIONS.filter(def => !existingNames.has(def.name));
    if (toInsert.length > 0) {
      await supabase.from('achievements').insert(toInsert);
    }
  } catch (error) {
    console.error('Seed error:', error);
  }
}
