const express = require('express');
const cors = require('cors');
const { createAppointment, isSlotBooked } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
}));
app.use(express.json());

// -----------------------------------------------------------------------------
// In-memory data (mirrors frontend mock data and documentation)
// -----------------------------------------------------------------------------

const topics = [
  {
    id: '1',
    name: 'Personal Loans',
    description: 'Apply for personal loans, discuss rates and terms',
  },
  {
    id: '2',
    name: 'Credit Cards',
    description: 'Apply for credit cards or discuss existing accounts',
  },
  {
    id: '3',
    name: 'Business Banking',
    description: 'Open business accounts, loans, and merchant services',
  },
  {
    id: '4',
    name: 'Mortgage Services',
    description: 'Home loans, refinancing, and mortgage consultations',
  },
  {
    id: '5',
    name: 'Investment Advisory',
    description: 'Financial planning and investment consultation',
  },
];

const branches = [
  {
    id: '1',
    name: 'Downtown Main Branch',
    address: '123 Main Street, Suite 100, Downtown, CA 90001',
    phone: '(555) 123-4567',
    supportedTopicIds: ['1', '2', '3', '4', '5'],
  },
  {
    id: '2',
    name: 'Westside Branch',
    address: '456 West Avenue, Westside, CA 90002',
    phone: '(555) 234-5678',
    supportedTopicIds: ['1', '2', '4'],
  },
  {
    id: '3',
    name: 'Business District Branch',
    address: '789 Commerce Blvd, Business District, CA 90003',
    phone: '(555) 345-6789',
    supportedTopicIds: ['2', '3', '5'],
  },
  {
    id: '4',
    name: 'Suburban Plaza Branch',
    address: '321 Plaza Drive, Suburban, CA 90004',
    phone: '(555) 456-7890',
    supportedTopicIds: ['1', '2', '4'],
  },
];

// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------

function generateId() {
  return `apt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isValidDateTime(dateTime) {
  const d = new Date(dateTime);
  return !Number.isNaN(d.getTime());
}

function isFutureDateTime(dateTime) {
  const d = new Date(dateTime);
  return d.getTime() > Date.now();
}

function isThirtyMinuteIncrement(dateTime) {
  const d = new Date(dateTime);
  const minutes = d.getMinutes();
  return minutes === 0 || minutes === 30;
}

function getBusinessHoursForDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay(); // 0=Sun, 6=Sat

  if (day === 0) {
    return null; // Sunday closed
  }

  if (day === 6) {
    // Saturday: 9:00 - 13:00, no lunch break
    return {
      openHour: 9,
      closeHour: 13,
      lunchStart: null,
      lunchEnd: null,
    };
  }

  // Monday–Friday: 9:00 - 17:00, lunch 12:00–13:00
  return {
    openHour: 9,
    closeHour: 17,
    lunchStart: 12,
    lunchEnd: 13,
  };
}

function generateSlots(branchId, dateString) {
  const hoursConfig = getBusinessHoursForDate(dateString);
  if (!hoursConfig) {
    return [];
  }

  const { openHour, closeHour, lunchStart, lunchEnd } = hoursConfig;
  const slots = [];

  for (let hour = openHour; hour < closeHour; hour++) {
    if (lunchStart !== null && hour >= lunchStart && hour < lunchEnd) {
      continue;
    }
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
      const dateTime = `${dateString}T${timeString}`;
      const booked = isSlotBooked(branchId, dateTime);
      const available = !booked;
      slots.push({ dateTime, available });
    }
  }

  return slots;
}

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 1. GET /api/topics
app.get('/api/topics', (req, res) => {
  res.json(topics);
});

// 2. GET /api/branches?topicId={topicId}
app.get('/api/branches', (req, res) => {
  const { topicId } = req.query;

  if (!topicId) {
    return res.status(400).json({
      error: 'Missing required query parameter: topicId',
      timestamp: new Date().toISOString(),
    });
  }

  const filtered = branches.filter((b) => b.supportedTopicIds.includes(String(topicId)));
  res.json(filtered);
});

// 3. GET /api/appointments/available-dates?branchId={branchId}
app.get('/api/appointments/available-dates', (req, res) => {
  const { branchId } = req.query;

  if (!branchId) {
    return res.status(400).json({
      error: 'Missing required query parameter: branchId',
      timestamp: new Date().toISOString(),
    });
  }

  const branchExists = branches.some((b) => b.id === String(branchId));
  if (!branchExists) {
    return res.status(404).json({
      error: 'Branch not found',
      timestamp: new Date().toISOString(),
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = [];
  // Look ahead next 28 days, collect dates that have at least one available slot
  for (let i = 1; i <= 28; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateString = d.toISOString().split('T')[0];

    const slots = generateSlots(String(branchId), dateString);
    if (slots.some((s) => s.available)) {
      result.push(dateString);
    }
  }

  res.json(result);
});

// 4. GET /api/appointments/available-slots?branchId={branchId}&date={date}
app.get('/api/appointments/available-slots', (req, res) => {
  const { branchId, date } = req.query;

  if (!branchId || !date) {
    return res.status(400).json({
      error: 'Missing required query parameters: branchId, date',
      timestamp: new Date().toISOString(),
    });
  }

  const branchExists = branches.some((b) => b.id === String(branchId));
  if (!branchExists) {
    return res.status(404).json({
      error: 'Branch not found',
      timestamp: new Date().toISOString(),
    });
  }

  const slots = generateSlots(String(branchId), String(date));
  res.json(slots);
});

// 5. POST /api/appointments
app.post('/api/appointments', (req, res) => {
  const { name, email, topicId, branchId, dateTime, reason } = req.body || {};

  if (!name || !email || !topicId || !branchId || !dateTime) {
    return res.status(400).json({
      error: 'Missing required fields',
      timestamp: new Date().toISOString(),
    });
  }

  // Validate topic and branch
  const topic = topics.find((t) => t.id === String(topicId));
  if (!topic) {
    return res.status(404).json({
      error: 'Topic not found',
      timestamp: new Date().toISOString(),
    });
  }

  const branch = branches.find((b) => b.id === String(branchId));
  if (!branch) {
    return res.status(404).json({
      error: 'Branch not found',
      timestamp: new Date().toISOString(),
    });
  }

  if (!branch.supportedTopicIds.includes(String(topicId))) {
    return res.status(400).json({
      error: 'Selected branch does not support this topic',
      timestamp: new Date().toISOString(),
    });
  }

  if (!isValidDateTime(dateTime)) {
    return res.status(400).json({
      error: 'Invalid dateTime format',
      timestamp: new Date().toISOString(),
    });
  }

  if (!isFutureDateTime(dateTime)) {
    return res.status(400).json({
      error: 'Appointment must be in the future',
      timestamp: new Date().toISOString(),
    });
  }

  if (!isThirtyMinuteIncrement(dateTime)) {
    return res.status(400).json({
      error: 'Appointment time must be in 30-minute increments',
      timestamp: new Date().toISOString(),
    });
  }

  // Ensure the requested time falls within branch business hours for that date
  const [datePart, timePart] = dateTime.split('T');
  const hoursConfig = getBusinessHoursForDate(datePart);
  if (!hoursConfig) {
    return res.status(400).json({
      error: 'Branch is closed on the selected date',
      timestamp: new Date().toISOString(),
    });
  }

  const [hourStr] = timePart.split(':');
  const hour = Number(hourStr);

  if (hour < hoursConfig.openHour || hour >= hoursConfig.closeHour) {
    return res.status(400).json({
      error: 'Selected time is outside business hours',
      timestamp: new Date().toISOString(),
    });
  }

  if (
    hoursConfig.lunchStart !== null &&
    hour >= hoursConfig.lunchStart &&
    hour < hoursConfig.lunchEnd
  ) {
    return res.status(400).json({
      error: 'Selected time is during lunch break',
      timestamp: new Date().toISOString(),
    });
  }

  // Check for double booking against database
  if (isSlotBooked(branchId, dateTime)) {
    return res.status(400).json({
      error: 'Time slot is no longer available',
      timestamp: new Date().toISOString(),
    });
  }

  const id = generateId();
  const createdAt = new Date().toISOString();

  const appointment = {
    id,
    name,
    email,
    topicId: String(topicId),
    branchId: String(branchId),
    dateTime,
    reason: reason || '',
    createdAt,
  };

  try {
    createAppointment(appointment);
  } catch (err) {
    // Unique constraint violation = slot already booked (race condition)
    if (err && err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({
        error: 'Time slot is no longer available',
        timestamp: new Date().toISOString(),
      });
    }

    console.error('Failed to create appointment:', err);
    return res.status(500).json({
      error: 'Failed to create appointment',
      timestamp: new Date().toISOString(),
    });
  }

  res.status(201).json(appointment);
});

// -----------------------------------------------------------------------------
// Start server
// -----------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});

