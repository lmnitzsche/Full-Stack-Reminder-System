-- Check if pg_cron extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- If not enabled, enable it:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Check all cron jobs
SELECT * FROM cron.job;

-- Check recent cron job executions
SELECT 
  j.jobname,
  d.start_time,
  d.end_time,
  d.status,
  d.return_message
FROM cron.job j
LEFT JOIN cron.job_run_details d ON j.jobid = d.jobid
ORDER BY d.start_time DESC 
LIMIT 20;
