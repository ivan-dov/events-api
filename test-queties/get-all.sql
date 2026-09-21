SELECT b.id as booking_id,
       b.event_id,
       b.attendee_id,
       e.name as event_name,
       a.full_name as attendee_full_name,
       a.department as attendee_department,
       e.budget_cents as event_budget,
       b.cost_cents as attend_cost,
       b.status as attendance_status
FROM bookings b
FULL JOIN events e ON e.id = b.event_id
FULL JOIN attendees a ON a.id = b.attendee_id;