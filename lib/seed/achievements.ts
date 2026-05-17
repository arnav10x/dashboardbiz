export const ACHIEVEMENT_DEFINITIONS = [
  // Outreach Badges
  { name: 'First Contact', description: 'Sent your very first DM.', category: 'Outreach', badge_image_url: '🚀' },
  { name: 'Century', description: 'Sent 100 total outbound messages.', category: 'Outreach', badge_image_url: '💯' },
  { name: 'War Dialer', description: 'Crushed out 500 total DMs.', category: 'Outreach', badge_image_url: '⚔️' },
  { name: 'Relentless', description: 'Hit your daily outreach target 7 days in a row.', category: 'Outreach', badge_image_url: '🔥' },
  
  // Sales Badges
  { name: 'First Reply', description: 'Generated a response from a cold prospect.', category: 'Sales', badge_image_url: '💬' },
  { name: 'Booked', description: 'Secured your first sales call.', category: 'Sales', badge_image_url: '📅' },
  { name: 'Closed', description: 'Landed your first paying client.', category: 'Sales', badge_image_url: '🤝' },
  { name: 'Three-Peat', description: 'Closed 3 paying clients.', category: 'Sales', badge_image_url: '🏆' },
  
  // Consistency Badges
  { name: 'Day 7', description: 'Completed Week 1 of the Founder OS Roadmap.', category: 'Consistency', badge_image_url: '7️⃣' },
  { name: 'Halfway', description: 'Reached Day 15. The point of no return.', category: 'Consistency', badge_image_url: '🌗' },
  { name: 'Finisher', description: 'Completed all 30 days of the Roadmap.', category: 'Consistency', badge_image_url: '👑' },
  { name: 'Locked In', description: 'Logged activity 14 days consecutively.', category: 'Consistency', badge_image_url: '🔒' },

  // Performance Badges
  { name: 'Sharp Shooter', description: 'Maintained a 10%+ reply rate for a full week.', category: 'Performance', badge_image_url: '🎯' },
  { name: 'Converter', description: 'Reached a 20%+ call-to-close rate.', category: 'Performance', badge_image_url: '📈' },
];

// Helper to seed missing achievements into the database. In production, this runs on migrations.
export async function ensureAchievementsSeeded(supabase: any) {
  try {
    const { data: existing } = await supabase.from('achievements').select('name');
    const existingNames = new Set((existing || []).map((a: any) => a.name));

    const toInsert = ACHIEVEMENT_DEFINITIONS.filter(def => !existingNames.has(def.name));
    if (toInsert.length > 0) {
      await supabase.from('achievements').insert(toInsert);
    }
  } catch (error) {
    console.error("Seed error:", error);
  }
}
