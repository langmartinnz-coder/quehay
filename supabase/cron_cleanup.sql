-- Enable pg_cron extension (run once as superuser)
create extension if not exists pg_cron;

-- Schedule daily cleanup: delete events whose start date is more than 1 day in the past.
-- Runs every day at midnight UTC.
select cron.schedule(
  'delete-past-events',           -- job name (unique)
  '0 0 * * *',                    -- cron expression: midnight UTC daily
  $$
    delete from events
    where date_start < current_date - interval '1 day';
  $$
);
