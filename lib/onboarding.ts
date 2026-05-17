"use server"

import { createClient } from '@/lib/supabase/server';
import { OnboardingData } from '@/types/onboarding';

export async function completeOnboarding(data: OnboardingData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // 1. Upsert into business_profiles (handles retries / back-navigation)
  const { error: profileError } = await supabase.from('business_profiles').upsert({
    user_id: user.id,
    niche: data.niche,
    service: data.service,
    offer_statement: data.offerStatement,
    price: data.price,
    monthly_goal: data.monthlyGoal,
  }, { onConflict: 'user_id' });

  if (profileError) {
    throw new Error(profileError.message);
  }

  // 2. Initialize roadmap day 1
  const { data: day1 } = await supabase
    .from('roadmap_days')
    .select('id')
    .eq('day_number', 1)
    .single();

  if (day1) {
    await supabase.from('user_progress').upsert({
      user_id: user.id,
      current_roadmap_day_id: day1.id,
    }, { onConflict: 'user_id' });
  }

  return { success: true };
}
