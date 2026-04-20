import { NextResponse } from 'next/server';
import { getTodayTasks } from '@/lib/tasks';

export async function GET() {
  try {
    const payload = await getTodayTasks();
    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('Error fetching tasks API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
