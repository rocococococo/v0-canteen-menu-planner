-- Fix date mismatch: Update test menu dates to today
UPDATE Menu SET date = '2025-11-22' WHERE date = '2025-11-23';
