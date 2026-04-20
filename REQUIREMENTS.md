# Founder OS - Product Requirements Document (PRD)

## 1. Product Overview & Core Philosophy

**Overview:**
Founder OS is a 30-day performance coaching OS for beginner online service business founders (ages 16–24). It guides users from $0 to their first 1–3 paying clients through structured daily execution, AI-tailored outreach coaching, and progress tracking.

**Core Philosophy:**
- The product is a strict performance coach, not a friendly assistant.
- It removes decision paralysis by giving users explicit, non-negotiable daily revenue actions.
- The predefined 30-day roadmap is fixed; AI personalizes execution within that structure.
- Every feature must answer: *"Does this help someone get clients faster?"*

---

## 2. User Personas

### Primary Persona: "Hustle Phase" Hustler (Leo)
- **Demographics:** Age 16–24, mostly male, solo operator.
- **Background:** High school or college student, or dropout. Consumes a lot of entrepreneurship content (Iman Gadzhi, Alex Hormozi) on YouTube.
- **Current State:** Has an idea (SMMA, web design, freelance, or AI automation agency) but $0 in revenue. Lacks structure, accountability, and sales experience. Prone to shiny object syndrome.
- **Pain Points:** Overwhelmed by information, doesn't know what to do *today*, afraid of rejection, struggles with consistency.
- **Goals:** Get the first 1-3 paying clients, prove to family/friends (and themselves) that this business model works, achieve initial financial independence.

---

## 3. Core User Stories

*As a beginner founder...*

**Onboarding & Setup**
1. As a user, I want to input my chosen niche and service so that the 30-day roadmap is tailored to my specific business type.
2. As a user, I want to commit to a specific daily outreach volume target so that I have a clear baseline for success.

**Execution & Focus**
3. As a user, I want to log in and immediately see my 1-3 non-negotiable daily tasks so that I don't waste time figuring out what to do.
4. As a user, I want a "Focus Mode" timer for outreach tasks so that I can execute without distractions.
5. As a user, I want an end-of-day reflection check-in so that I can acknowledge what I did well and what I avoided.

**AI Coaching & Support**
6. As a user, I want to generate variations of cold outreach messages tailored to my niche so that I can start sending DMs faster.
7. As a user, I want to paste a prospect's objection and explicitly get a script on how to overcome it so that I can keep the conversation going.
8. As a user, I want a pre-call AI roleplay or checklist before my sales meetings so that I feel confident jumping on a closing call.
9. As a user, I want the AI to give me "tough love" if I miss 3 days in a row so that I snap out of my procrastination.

**Tracking & Pipeline**
10. As a user, I want to log the number of outreach messages sent and replies received so that I can see if my script is working.
11. As a user, I want a very basic Kanban board (Lead, Contacted, Meeting Booked, Closed) so that I don't drop warm leads.
12. As a user, I want a visual progress bar or tracker for the 30 days so that I feel momentum and don't want to break the chain.

**Milestones & Motivation**
13. As a user, I want the system to penalize or strictly call out missed daily tasks so that I feel urgency to complete them.
14. As a user, I want the system to celebrate when I log my first "Meeting Booked" so that I stay motivated.
15. As a user, I want a highly satisfying, celebratory screen when I log a "Closed Client" and revenue generated so that I feel accomplished.

---

## 4. Feature Priority Matrix

### Must-Have (MVP - Launch in 30-45 Days)
- **Onboarding Questionnaire:** Capture niche, service, and baseline commitment.
- **Daily Action Dashboard:** Fixed 30-day roadmap serving 1-3 explicit, non-negotiable tasks per day.
- **Simple Metric Tracker:** Daily inputs for DMs sent, replies, meetings booked, and revenue.
- **AI Coach Interface:** Chat interface pre-prompted to act as a strict performance/sales coach.
- **Basic Lead Pipeline:** Simple list or board to track warm leads.
- **Authentication:** Standard Email/Password or Social login.

### Should-Have (v1.1 - Fast Follows)
- **Focus Timer:** Built-in Pomodoro/countdown for outreach sprints.
- **Dynamic AI Prompts:** One-click buttons like "Handle Objection" or "Rewrite Pitch".
- **Daily Streak & Penalties:** Visual indicators of consistency and alerts for missing days.
- **Template Library:** Basic access to proven outreach and sales scripts.

### Won't-Have (Explicitly Deprioritized)
- **Complex CRM Automations:** Automated email sequencing or deep tool integrations. *(Reasoning: Prevents action, adds build time).*
- **Social/Community Features:** A feed, comments, or forum. *(Reasoning: Distraction from getting clients).*
- **Course Hosting:** Long-form educational video series. *(Reasoning: Execution-only platform, not standard ed-tech).*
- **Payment Processing:** Stripe integrations to bill *their* clients. *(Reasoning: Too complex for MVP, users can use external standalone tools).*

---

## 5. Success Metrics

### 30 Days (Immediate Beta/MVP Phase)
- **Activation:** 60%+ of registered users complete their daily tasks for the first 3 consecutive days.
- **Engagement:** DAU/MAU ratio > 40%.
- **Outcome:** 20% of users who finish the 30-day roadmap secure at least 1 paying client.

### 90 Days (Validation Phase)
- **Retention:** 30%+ of users re-engage with the app after the first 30 days to use the pipeline and AI coach.
- **Outcome:** Average reported revenue generated per active core user > $500.
- **Growth:** 100+ active users via organic word-of-mouth and target audience sharing.

### 6 Months (Growth Phase)
- **Monetization:** Successfully launch a paid tier/freemium model and convert 5-10% of active free users.
- **Outcome:** Tangible library of user case studies and testimonials (e.g., first 50 clients generated system-wide across all users).

---

## 6. Non-Functional Requirements

- **Performance:** App must load globally in under 2 seconds. The daily checklist and dashboard must feel instantaneous to reduce friction.
- **Security:** Secure authentication and secure storage of user data (especially pipeline and revenue figures).
- **Accessibility:** Clear, high-contrast UI suitable for reading text-heavy AI advice; visually distinct call-to-actions.
- **Mobile Responsiveness:** MUST be perfectly usable on mobile devices, as this demographic highly indexes on mobile usage, though desktop is encouraged for deep work.

---

## 7. Known Constraints

- **Resources:** Solo high school developer building both frontend and backend.
- **Budget:** $0 budget (excluding domain name). Architecture must heavily leverage generous free tiers (e.g., Vercel, Supabase/Firebase, open-source or free-tier AI APIs).
- **Timeline:** Strict 30-45 day build window for the MVP. Scope creep is the biggest risk and must be fiercely combated.
