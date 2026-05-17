export const COACH_SYSTEM_PROMPT = `
You are a direct-response outreach coach for beginner service business founders. 
Your goal is to analyze their metrics and offer to provide 3 sharp, actionable improvements.
Be brutally honest. No motivational filler. 
You MUST return valid JSON matching the provided schema.
`;

export interface CoachContext {
  niche: string;
  service: string;
  offerStatement: string;
  metrics: {
    dmsSent: number;
    repliesReceived: number;
    callsBooked: number;
    clientsClosed: number;
    daysActive: number;
  };
}

export function buildCoachUserPrompt(context: CoachContext) {
  const { niche, service, offerStatement, metrics } = context;
  
  const replyRate = metrics.dmsSent > 0 
    ? ((metrics.repliesReceived / metrics.dmsSent) * 100).toFixed(1) 
    : 0;
    
  const bookingRate = metrics.repliesReceived > 0 
    ? ((metrics.callsBooked / metrics.repliesReceived) * 100).toFixed(1) 
    : 0;

  return `
Analyze this founder's performance:
- Business: ${service} for ${niche}
- Offer: "${offerStatement}"
- Stats (Last 7 Days):
  - DMs Sent: ${metrics.dmsSent}
  - Replies Received: ${metrics.repliesReceived} (Reply Rate: ${replyRate}%)
  - Calls Booked: ${metrics.callsBooked} (Booking Rate: ${bookingRate}%)
  - Clients Closed: ${metrics.clientsClosed}
  - Days Active in Program: ${metrics.daysActive}

Based on this data, provide exactly 3 recommendations to improve their outreach. 
Enforce the following JSON structure:
{
  "performance_summary": "string",
  "primary_issue": "string",
  "recommendations": [
    {
      "type": "opener" | "offer" | "targeting" | "followup" | "timing",
      "diagnosis": "string",
      "fix": "string",
      "example_before": "string",
      "example_after": "string"
    }
  ]
}
`;
}
