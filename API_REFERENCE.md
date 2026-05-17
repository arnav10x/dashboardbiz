# Founder OS - API Reference

This document outlines the REST API routes for Founder OS backend, built with Next.js 14 App Router (`/app/api/...`), utilizing Supabase for database + auth and the OpenAI API for intelligence.

All routes expect to be called from the client browser and rely on the Supabase Auth session established via cookies. Content-Type is always `application/json` unless otherwise specified.

---

## 1. Auth Routes

Supabase handles primary auth flows (signup, login) directly on the client. The Next.js backend handles the PKCE callback.

### `GET /auth/callback`
The standard Supabase PKCE OAuth/Email callback route for Server-Side Auth.
- **Request Body:** None (reads query param `code`)
- **Response Body:** Redirects to `/dashboard` or `/onboarding`
- **Auth Requirement:** Public (establishes the cookie session)
- **Supabase Tables:** Handles `auth.users` implicitly via Supabase client.
- **Error Cases:** 400 Bad Request if code is missing or invalid.

---

## 2. Onboarding

### `POST /api/onboarding`
Saves the user's initial intake form, triggers the AI offer generation if no offer was provided, and initializes their business profile.
- **Request Body:**
  ```typescript
  interface OnboardingRequest {
    niche: string;
    service: string;
    monthlyGoal: number;
    rawAnswers: Array<{
      questionId: string;
      answerText: string;
    }>;
  }
  ```
- **Response Body:**
  ```typescript
  interface OnboardingResponse {
    businessProfileId: string;
    refinedOffer: string;
    status: 'success';
  }
  ```
- **Auth Requirement:** Authenticated
- **Supabase Actions:**
  - `INSERT` into `onboarding_responses`
  - `INSERT` into `business_profiles`
  - `INSERT` into `user_progress` (initializes day 1)
- **OpenAI Actions:** Calls the ChatGPT API internally if an offer statement needs synthesizing.
- **Error Cases:** 401 Unauthorized, 400 Validation Error, 500 DB Error.

---

## 3. AI Services

### `POST /api/ai/generate-offer`
A standalone endpoint for explicitly refining an offer statement based on niche and service.
- **Request Body:**
  ```typescript
  interface GenerateOfferRequest {
    niche: string;
    service: string;
    targetAvatarContext?: string;
  }
  ```
- **Response Body:**
  ```typescript
  interface GenerateOfferResponse {
    offerStatement: string;
    reasoning: string;
  }
  ```
- **Auth Requirement:** Authenticated
- **OpenAI Actions:** System prompt structured for Direct Response Marketing / Alex Hormozi style "Grand Slam Offer" generation.
- **Supabase Actions:** None directly (stateless utility).
- **Error Cases:** 401 Unauthorized, 429 Rate Limit Exceeded, 500 AI Provider Error.

### `POST /api/ai/coach`
Given the user's current metrics, returns a personalized "tough love" improvement suggestion.
- **Request Body:**
  ```typescript
  interface AiCoachRequest {
    recentMetricSnapshotId?: string;
    contextOverride?: string; // Optional context, e.g., "I've been sick" or "I'm scared of calling"
  }
  ```
- **Response Body:**
  ```typescript
  interface AiCoachResponse {
    message: string;
    suggestedAction: string;
  }
  ```
- **Auth Requirement:** Authenticated
- **Supabase Actions:** `SELECT` from `metrics_snapshots`, `task_completions`.
- **OpenAI Actions:** System prompt acts as an aggressive performance coach.
- **Error Cases:** 401 Unauthorized, 429 Rate Limit Exceeded.

---

## 4. Daily Tasks

### `GET /api/tasks/today`
Returns the user's non-negotiable tasks for today, derived from their exact progress day on the roadmap.
- **Request Body:** None
- **Response Body:**
  ```typescript
  interface TasksTodayResponse {
    roadmapDay: number;
    dayTitle: string;
    isDayComplete: boolean;
    tasks: Array<{
      id: string; // daily_task_id
      title: string;
      description: string;
      isMandatory: boolean;
      isCompleted: boolean;
    }>;
  }
  ```
- **Auth Requirement:** Authenticated
- **Supabase Actions:**
  - `SELECT` from `user_progress`
  - `SELECT` from `roadmap_days`
  - `SELECT` from `daily_tasks`
  - `SELECT` from `task_completions` (to determine `isCompleted`)
- **Error Cases:** 401 Unauthorized, 404 No Progress Found.

### `POST /api/tasks/[taskId]/complete`
Marks a task done, updates internal streak logic, and checks if badges were unlocked.
- **Request Body:** None (status is toggled or explicitly set via query param, typically empty POST = complete).
- **Response Body:**
  ```typescript
  interface TaskCompleteResponse {
    taskId: string;
    completedAt: string;
    allDayTasksCompleted: boolean;
    newAchievementsEarned: Array<{
      id: string;
      name: string;
      badgeUrl: string;
    }>;
  }
  ```
- **Auth Requirement:** Authenticated
- **Supabase Actions:**
  - `INSERT` into `task_completions`
  - *Trigger/Logic:* Query `achievements` and `task_completions` to conditionally `INSERT` into `user_achievements`.
- **Error Cases:** 401 Unauthorized, 404 Task Not Found, 409 Task Already Completed.

---

## 5. Lead Tracking

### `GET /api/leads`
Retrieves all leads, typically formatted for Kanban board usage.
- **Request Body:** None
- **Response Body:**
  ```typescript
  interface LeadsResponse {
    leads: Array<{
      id: string;
      name: string;
      company?: string;
      niche?: string;
      status: string;
      createdAt: string;
    }>;
  }
  ```
- **Auth Requirement:** Authenticated
- **Supabase Actions:** `SELECT` from `leads`

### `POST /api/leads`
Creates a new lead.
- **Request Body:**
  ```typescript
  interface CreateLeadRequest {
    name: string;
    company?: string;
    contactInfo?: string;
    niche?: string;
  }
  ```
- **Response Body:** The newly created lead object.
- **Auth Requirement:** Authenticated
- **Supabase Actions:** `INSERT` into `leads`

### `GET /api/leads/[id]`
Detailed view of a single lead including activity history.
- **Response Body:** Lead object + Array of `lead_activities`.
- **Supabase Actions:** `SELECT` from `leads` with `lead_activities` join.

### `PUT /api/leads/[id]`
Updates generic lead data (name, company, contact).

### `DELETE /api/leads/[id]`
Deletes a lead from the pipeline.

### `POST /api/leads/[id]/activity`
Logs a status change (e.g., moved from "Lead" to "Contacted").
- **Request Body:**
  ```typescript
  interface LogActivityRequest {
    activityType: 'contacted' | 'replied' | 'booked' | 'closed';
    notes?: string;
    updateLeadStatus?: boolean; // If true, also updates the lead table's status
  }
  ```
- **Response Body:**
  ```typescript
  interface LogActivityResponse {
    activityId: string;
    newStatus: string;
  }
  ```
- **Auth Requirement:** Authenticated
- **Supabase Actions:**
  - `INSERT` into `lead_activities`
  - conditionally `UPDATE` `leads.status`
- **Error Cases:** 401 Unauthorized, 404 Lead Not Found.

---

## 6. Metrics & Achievements

### `GET /api/metrics`
Returns dashboard aggregates: total DMs this week, calls booked, closed clients, conversion %.
- **Request Body:** None
- **Query Params:** `?timeframe=week|month|allTime`
- **Response Body:**
  ```typescript
  interface MetricsResponse {
    dmsSent: number;
    callsBooked: number;
    clientsClosed: number;
    revenue: number;
    bookingConversionRate: number; // percentage
    closingConversionRate: number; // percentage
  }
  ```
- **Auth Requirement:** Authenticated
- **Supabase Actions:** `SELECT` / aggregations mapped from `lead_activities` or reading from synced `metrics_snapshots`.

### `GET /api/achievements`
Returns the user's earned badges compared to the global list of locked badges.
- **Request Body:** None
- **Response Body:**
  ```typescript
  interface AchievementsResponse {
    earned: Array<{
      id: string;
      name: string;
      description: string;
      badgeUrl: string;
      earnedAt: string;
    }>;
    locked: Array<{
      id: string;
      name: string;
      description: string;
      badgeUrl: string;
    }>;
  }
  ```
- **Auth Requirement:** Authenticated
- **Supabase Actions:**
  - `SELECT` from `achievements`
  - `SELECT` from `user_achievements` (joined to split into earned vs. locked).
