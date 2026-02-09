/**
 * Reset the appointments database: deletes all appointments.
 * Run from the backend folder: node reset-db.js
 */
const { db } = require('./db');

const result = db.prepare('DELETE FROM appointments').run();
console.log(`Deleted ${result.changes} appointment(s). Database is now empty.`);
