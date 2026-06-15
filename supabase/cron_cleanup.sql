-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1 — Enable pg_cron (Dashboard → Database → Extensions → pg_cron)
-- Then run this SQL in Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- Schedule daily cleanup: delete events whose start date is more than 1 day in the past.
-- Runs every day at 02:00 UTC.
-- Use cron.unschedule first if re-running to avoid duplicate job names.
SELECT cron.unschedule('delete-past-events');

SELECT cron.schedule(
  'delete-past-events',
  '0 2 * * *',
  $$
    DELETE FROM public.events
    WHERE date_start < current_date - INTERVAL '1 day';
  $$
);


-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES — run these separately to confirm the job is working
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Confirm pg_cron extension is installed
SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_cron';
-- Expected: one row with extname = 'pg_cron'

-- 2. Confirm the job is scheduled
SELECT jobid, jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'delete-past-events';
-- Expected: one row with active = true

-- 3. Check recent run history (last 10 executions)
SELECT jrd.runid, jrd.job_id, jrd.status, jrd.start_time, jrd.end_time, jrd.return_message
FROM cron.job_run_details jrd
JOIN cron.job j ON j.jobid = jrd.job_id
WHERE j.jobname = 'delete-past-events'
ORDER BY jrd.start_time DESC
LIMIT 10;
-- Look for status = 'succeeded'; errors appear in return_message

-- 4. Count events that WOULD be deleted by the next run
SELECT COUNT(*) AS events_to_delete
FROM public.events
WHERE date_start < current_date - INTERVAL '1 day';

-- 5. Manual immediate cleanup (run if the cron hasn't fired yet)
DELETE FROM public.events
WHERE date_start < current_date - INTERVAL '1 day';
