const path = require('path');
const Database = require('better-sqlite3');

// Database file in the backend directory
const dbPath = path.join(__dirname, 'appointments.db');
const db = new Database(dbPath);

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    date_time TEXT NOT NULL,
    reason TEXT,
    created_at TEXT NOT NULL,
    UNIQUE (branch_id, date_time)
  );
`);

const insertStmt = db.prepare(`
  INSERT INTO appointments (
    id, name, email, topic_id, branch_id, date_time, reason, created_at
  ) VALUES (
    @id, @name, @email, @topic_id, @branch_id, @date_time, @reason, @created_at
  );
`);

const findByBranchAndDateStmt = db.prepare(`
  SELECT id, name, email, topic_id as topicId, branch_id as branchId,
         date_time as dateTime, reason, created_at as createdAt
  FROM appointments
  WHERE branch_id = ? AND date_time LIKE ?;
`);

const findSlotStmt = db.prepare(`
  SELECT 1
  FROM appointments
  WHERE branch_id = ? AND (date_time = ? OR date_time = ?)
  LIMIT 1;
`);

function createAppointment(appointment) {
  insertStmt.run({
    id: appointment.id,
    name: appointment.name,
    email: appointment.email,
    topic_id: appointment.topicId,
    branch_id: appointment.branchId,
    date_time: appointment.dateTime,
    reason: appointment.reason || '',
    created_at: appointment.createdAt,
  });
}

/** Match both "2026-02-01T09:00" and "2026-02-01T09:00:00" so old and new records are found */
function isSlotBooked(branchId, dateTime) {
  const withSeconds = dateTime.includes(':00:00') ? dateTime : dateTime + ':00';
  const withoutSeconds = withSeconds.replace(/:00$/, '');
  const row = findSlotStmt.get(String(branchId), withSeconds, withoutSeconds);
  return !!row;
}

function getAppointmentsForBranchDate(branchId, dateString) {
  // date_time stored as ISO string "YYYY-MM-DDTHH:mm:ss"
  const pattern = `${dateString}T%`;
  return findByBranchAndDateStmt.all(String(branchId), pattern);
}

module.exports = {
  db,
  createAppointment,
  isSlotBooked,
  getAppointmentsForBranchDate,
};

