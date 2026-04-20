"use server"

import { createClient } from '@/lib/supabase/server';
import { OnboardingData } from '@/types/onboarding';

export async function completeOnboarding(data: OnboardingData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // 1. Insert into business_profiles
  const { error: profileError } = await supabase.from('business_profiles').insert({
    user_id: user.id,
    niche: data.niche,
    service: data.service,
    offer_statement: data.offerStatement,
    price: data.price,
    monthly_goal: data.monthlyGoal,
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  // 2. Initialize roadmap day 1 (Assuming seed data is present, gracefully fail if not but continue onboarding)
  const { data: day1 } = await supabase
    .from('roadmap_days')
    .select('id')
    .eq('day_number', 1)
    .single();

  if (day1) {
    await supabase.from('user_progress').insert({
      user_id: user.id,
      current_roadmap_day_id: day1.id,
    });
  }

  return { success: true };
}
