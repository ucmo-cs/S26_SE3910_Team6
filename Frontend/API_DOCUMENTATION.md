# Spring Boot Backend API Documentation

This document outlines the REST API endpoints required for the Appointment Booking System. Your Spring Boot backend must implement these endpoints for the React frontend to function properly.

## Base URL Configuration

Update the `API_BASE_URL` in `/services/api.ts` to point to your Spring Boot backend:

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

---

## Required Endpoints

### 1. Get All Topics

**Endpoint:** `GET /api/topics`

**Description:** Retrieves all available appointment topics that users can book.

**Response:** `200 OK`

```json
[
  {
    "id": "1",
    "name": "Personal Loans",
    "description": "Apply for personal loans, discuss rates and terms"
  },
  {
    "id": "2",
    "name": "Credit Cards",
    "description": "Apply for credit cards or discuss existing accounts"
  },
  {
    "id": "3",
    "name": "Business Banking",
    "description": "Open business accounts, loans, and merchant services"
  },
  {
    "id": "4",
    "name": "Mortgage Services",
    "description": "Home loans, refinancing, and mortgage consultations"
  },
  {
    "id": "5",
    "name": "Investment Advisory",
    "description": "Financial planning and investment consultation"
  }
]
```

**Database Schema Suggestion:**
```sql
CREATE TABLE topics (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);
```

---

### 2. Get Branches by Topic

**Endpoint:** `GET /api/branches?topicId={topicId}`

**Description:** Retrieves all branches that support appointments for the specified topic.

**Query Parameters:**
- `topicId` (required): The ID of the selected topic

**Response:** `200 OK`

```json
[
  {
    "id": "1",
    "name": "Downtown Main Branch",
    "address": "123 Main Street, Suite 100, Downtown, CA 90001",
    "phone": "(555) 123-4567",
    "supportedTopicIds": ["1", "2", "3", "4", "5"]
  },
  {
    "id": "2",
    "name": "Westside Branch",
    "address": "456 West Avenue, Westside, CA 90002",
    "phone": "(555) 234-5678",
    "supportedTopicIds": ["1", "2", "4"]
  },
  {
    "id": "3",
    "name": "Business District Branch",
    "address": "789 Commerce Blvd, Business District, CA 90003",
    "phone": "(555) 345-6789",
    "supportedTopicIds": ["2", "3", "5"]
  }
]
```

**Database Schema Suggestion:**
```sql
CREATE TABLE branches (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20)
);

CREATE TABLE branch_topics (
    branch_id VARCHAR(36) REFERENCES branches(id),
    topic_id VARCHAR(36) REFERENCES topics(id),
    PRIMARY KEY (branch_id, topic_id)
);
```

**Implementation Note:** Filter branches by checking if they support the requested `topicId` in the `branch_topics` join table.

---

### 3. Get Available Dates

**Endpoint:** `GET /api/appointments/available-dates?branchId={branchId}`

**Description:** Retrieves a list of dates that have at least one available appointment slot at the specified branch.

**Query Parameters:**
- `branchId` (required): The ID of the selected branch

**Response:** `200 OK`

```json
[
  "2026-02-01",
  "2026-02-02",
  "2026-02-03",
  "2026-02-04",
  "2026-02-05",
  "2026-02-08",
  "2026-02-09",
  "2026-02-10"
]
```

**Implementation Notes:**
- Return dates in `YYYY-MM-DD` format
- Only return dates that have at least one available 30-minute slot
- Typically return 2-4 weeks of future dates
- Exclude past dates
- Consider branch business hours (see stretch goal #2)
- Do not return dates where all slots are already booked

---

### 4. Get Available Time Slots

**Endpoint:** `GET /api/appointments/available-slots?branchId={branchId}&date={date}`

**Description:** Retrieves all 30-minute time slots for a specific date and branch, indicating which are available and which are booked.

**Query Parameters:**
- `branchId` (required): The ID of the branch
- `date` (required): The date in `YYYY-MM-DD` format

**Response:** `200 OK`

```json
[
  {
    "dateTime": "2026-02-01T09:00:00",
    "available": true
  },
  {
    "dateTime": "2026-02-01T09:30:00",
    "available": true
  },
  {
    "dateTime": "2026-02-01T10:00:00",
    "available": false
  },
  {
    "dateTime": "2026-02-01T10:30:00",
    "available": true
  },
  {
    "dateTime": "2026-02-01T11:00:00",
    "available": true
  },
  {
    "dateTime": "2026-02-01T11:30:00",
    "available": true
  },
  {
    "dateTime": "2026-02-01T13:00:00",
    "available": true
  },
  {
    "dateTime": "2026-02-01T13:30:00",
    "available": true
  },
  {
    "dateTime": "2026-02-01T14:00:00",
    "available": false
  },
  {
    "dateTime": "2026-02-01T14:30:00",
    "available": true
  },
  {
    "dateTime": "2026-02-01T15:00:00",
    "available": true
  },
  {
    "dateTime": "2026-02-01T15:30:00",
    "available": true
  },
  {
    "dateTime": "2026-02-01T16:00:00",
    "available": true
  },
  {
    "dateTime": "2026-02-01T16:30:00",
    "available": true
  }
]
```

**Implementation Notes:**
- Each appointment slot is exactly 30 minutes
- Return `dateTime` in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss`
- Mark `available: false` for slots that already have a booked appointment
- Typical business hours: 9:00 AM - 5:00 PM (with lunch break 12:00-1:00 PM)
- Consider branch-specific business hours (see stretch goal #2)

**Algorithm Suggestion:**
1. Generate all 30-minute slots within business hours for the date
2. Query appointments table for existing bookings at this branch on this date
3. Mark slots as unavailable if they match an existing appointment's dateTime

---

### 5. Create Appointment

**Endpoint:** `POST /api/appointments`

**Description:** Creates a new appointment and reserves the time slot.

**Request Headers:**
- `Content-Type: application/json`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "topicId": "1",
  "branchId": "2",
  "dateTime": "2026-02-01T09:00:00",
  "reason": "I would like to discuss refinancing options for my current personal loan."
}
```

**Response:** `201 Created`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "topicId": "1",
  "branchId": "2",
  "dateTime": "2026-02-01T09:00:00",
  "reason": "I would like to discuss refinancing options for my current personal loan.",
  "createdAt": "2026-01-28T14:30:00"
}
```

**Error Responses:**

`400 Bad Request` - Validation error or slot already booked
```json
{
  "error": "Time slot is no longer available",
  "timestamp": "2026-01-28T14:30:00"
}
```

`404 Not Found` - Invalid branch or topic ID
```json
{
  "error": "Branch not found",
  "timestamp": "2026-01-28T14:30:00"
}
```

**Database Schema Suggestion:**
```sql
CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    topic_id VARCHAR(36) REFERENCES topics(id),
    branch_id VARCHAR(36) REFERENCES branches(id),
    date_time TIMESTAMP NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (branch_id, date_time)
);
```

**Critical Implementation Notes:**

1. **Race Condition Prevention:** Use database constraints or row-level locking to prevent double-booking
   ```sql
   UNIQUE (branch_id, date_time)
   ```

2. **Validation:**
   - Verify the branch supports the selected topic
   - Verify the time slot is available
   - Verify the dateTime is in the future
   - Verify the dateTime aligns with 30-minute intervals

3. **Transaction:** Wrap the availability check and insert in a database transaction

4. **Email Notification (Stretch Goal):** After successfully creating the appointment, trigger an email confirmation

**Example Spring Boot Controller:**
```java
@PostMapping("/appointments")
@Transactional
public ResponseEntity<AppointmentResponse> createAppointment(@RequestBody AppointmentRequest request) {
    // 1. Validate inputs
    // 2. Check if slot is still available
    // 3. Create appointment (will fail if slot taken due to UNIQUE constraint)
    // 4. Send email confirmation (stretch goal)
    // 5. Return created appointment
}
```

---

## Stretch Goal Endpoints

### 6. Send Email Confirmation

**Endpoint:** `POST /api/appointments/{id}/send-confirmation`

**Description:** Sends an email confirmation for an existing appointment.

**Path Parameters:**
- `id`: The appointment ID

**Response:** `200 OK`

```json
{
  "message": "Confirmation email sent successfully",
  "emailSentTo": "john.doe@example.com"
}
```

**Email Template Suggestion:**
```
Subject: Appointment Confirmation - [Bank Name]

Dear [Name],

Your appointment has been confirmed!

Appointment Details:
- Topic: [Topic Name]
- Location: [Branch Name]
  [Branch Address]
- Date: [Formatted Date]
- Time: [Formatted Time]
- Confirmation ID: [Appointment ID]

Please arrive 5-10 minutes early and bring a valid ID.

If you need to cancel or reschedule, please contact us at [Branch Phone].

Thank you,
[Bank Name]
```

---

### 7. Get Branch Business Hours

**Endpoint:** `GET /api/branches/{branchId}/hours?date={date}`

**Description:** Returns the business hours for a specific branch on a given date. This allows for different hours on different days of the week (e.g., shorter Saturday hours).

**Path Parameters:**
- `branchId`: The branch ID

**Query Parameters:**
- `date`: Date in `YYYY-MM-DD` format

**Response:** `200 OK`

```json
{
  "branchId": "1",
  "date": "2026-02-01",
  "dayOfWeek": "SATURDAY",
  "openTime": "09:00",
  "closeTime": "13:00",
  "lunchBreakStart": null,
  "lunchBreakEnd": null
}
```

**Example Hours by Day:**
- Monday-Friday: 9:00 AM - 5:00 PM (lunch: 12:00-1:00 PM)
- Saturday: 9:00 AM - 1:00 PM (no lunch break)
- Sunday: Closed

**Database Schema Suggestion:**
```sql
CREATE TABLE branch_hours (
    id VARCHAR(36) PRIMARY KEY,
    branch_id VARCHAR(36) REFERENCES branches(id),
    day_of_week VARCHAR(10), -- MONDAY, TUESDAY, etc.
    open_time TIME,
    close_time TIME,
    lunch_break_start TIME,
    lunch_break_end TIME
);
```

---

## CORS Configuration

Since the React frontend will run on a different port during development (typically `http://localhost:5173`), you must configure CORS in your Spring Boot application:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## Testing the Integration

### Using curl

1. **Test Get Topics:**
```bash
curl http://localhost:8080/api/topics
```

2. **Test Get Branches:**
```bash
curl "http://localhost:8080/api/branches?topicId=1"
```

3. **Test Get Available Dates:**
```bash
curl "http://localhost:8080/api/appointments/available-dates?branchId=1"
```

4. **Test Get Time Slots:**
```bash
curl "http://localhost:8080/api/appointments/available-slots?branchId=1&date=2026-02-01"
```

5. **Test Create Appointment:**
```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "topicId": "1",
    "branchId": "1",
    "dateTime": "2026-02-01T09:00:00",
    "reason": "Personal loan inquiry"
  }'
```

---

## Sample Data for Testing

### Topics
```sql
INSERT INTO topics (id, name, description) VALUES
('1', 'Personal Loans', 'Apply for personal loans, discuss rates and terms'),
('2', 'Credit Cards', 'Apply for credit cards or discuss existing accounts'),
('3', 'Business Banking', 'Open business accounts, loans, and merchant services'),
('4', 'Mortgage Services', 'Home loans, refinancing, and mortgage consultations'),
('5', 'Investment Advisory', 'Financial planning and investment consultation');
```

### Branches
```sql
INSERT INTO branches (id, name, address, phone) VALUES
('1', 'Downtown Main Branch', '123 Main Street, Suite 100, Downtown, CA 90001', '(555) 123-4567'),
('2', 'Westside Branch', '456 West Avenue, Westside, CA 90002', '(555) 234-5678'),
('3', 'Business District Branch', '789 Commerce Blvd, Business District, CA 90003', '(555) 345-6789'),
('4', 'Suburban Plaza Branch', '321 Plaza Drive, Suburban, CA 90004', '(555) 456-7890');
```

### Branch-Topic Relationships
```sql
INSERT INTO branch_topics (branch_id, topic_id) VALUES
-- Downtown Main supports all topics
('1', '1'), ('1', '2'), ('1', '3'), ('1', '4'), ('1', '5'),
-- Westside supports personal banking
('2', '1'), ('2', '2'), ('2', '4'),
-- Business District supports business and investments
('3', '2'), ('3', '3'), ('3', '5'),
-- Suburban supports personal banking
('4', '1'), ('4', '2'), ('4', '4');
```

---

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Frontend │  HTTP   │  Spring Boot App │  JDBC   │    Database     │
│  (Port 5173)    │ ◄─────► │  (Port 8080)     │ ◄─────► │   (MySQL/      │
│                 │         │                  │         │    PostgreSQL)  │
└─────────────────┘         └──────────────────┘         └─────────────────┘
     Web Server              Application Server              Database Server
```

---

## Next Steps

1. Set up your Spring Boot project with the required dependencies (Spring Web, Spring Data JPA, database driver)
2. Create the entity models for Topic, Branch, and Appointment
3. Implement the repository interfaces
4. Implement the service layer with business logic
5. Create the REST controllers with the endpoints documented above
6. Configure CORS as shown above
7. Test each endpoint using curl or Postman
8. Update the `API_BASE_URL` in the React frontend's `/services/api.ts` file
9. Start both servers and test the full integration

Good luck with your Spring 2026 project!
