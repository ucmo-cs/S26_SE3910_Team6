# Bank Appointment Booking System - React Frontend

This is the React frontend application for the UCM Spring 2026 appointment booking project. This application allows users to book appointments with bank representatives at various branch locations.

## Overview

This frontend application provides a complete user interface for the appointment booking system. It communicates with a Spring Boot backend via REST APIs.

### Features Implemented

✅ **Step-by-step booking flow:**
1. Select appointment topic
2. Choose branch location (filtered by selected topic)
3. Pick appointment date
4. Select available time slot (30-minute intervals)
5. Enter personal information and confirm

✅ **Dynamic filtering:**
- Branches are filtered based on selected topic
- Only available dates and times are shown
- Real-time availability checking

✅ **Professional UI/UX:**
- Clean, modern interface with Tailwind CSS
- Progress indicator showing current step
- Responsive design for mobile and desktop
- Clear error messaging
- Appointment confirmation page

✅ **API Integration:**
- All API endpoints documented
- Service layer for backend communication
- Error handling and loading states

## Project Structure

```
/
├── App.tsx                           # Main application component
├── components/
│   ├── AppointmentForm.tsx          # Multi-step booking form
│   └── ConfirmationPage.tsx         # Appointment confirmation display
├── services/
│   └── api.ts                       # API service layer with backend integration
├── API_DOCUMENTATION.md             # Complete API documentation for Spring Boot team
└── README.md                        # This file
```

## Getting Started

### Prerequisites

- Node.js 16+ installed
- A running Spring Boot backend (see API_DOCUMENTATION.md)

### Installation

This application runs in Figma Make's environment. To work with it locally:

1. The application is already configured with Tailwind CSS and React
2. Update the backend URL in `/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://localhost:8080/api';
   ```

### Running the Application

The application will automatically connect to your Spring Boot backend once it's running.

## Backend Integration

### Required Spring Boot Endpoints

Your Spring Boot backend must implement these REST endpoints:

1. `GET /api/topics` - Get all appointment topics
2. `GET /api/branches?topicId={id}` - Get branches that support a topic
3. `GET /api/appointments/available-dates?branchId={id}` - Get available dates
4. `GET /api/appointments/available-slots?branchId={id}&date={date}` - Get time slots
5. `POST /api/appointments` - Create new appointment

See **API_DOCUMENTATION.md** for complete endpoint specifications, request/response formats, and database schema suggestions.

### CORS Configuration

Your Spring Boot application must allow CORS requests from the frontend:

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

## User Flow

### 1. Select Topic
Users first choose what type of appointment they need (loans, credit cards, mortgages, etc.)

### 2. Choose Branch
Based on the selected topic, users see only branches that support that service. Each branch displays:
- Branch name
- Full address
- Phone number

### 3. Select Date
Users choose from a list of available dates. The backend should return dates that have at least one available time slot.

### 4. Select Time
30-minute time slots are displayed for the selected date. Only available slots are shown to users.

### 5. Enter Details & Confirm
Users provide:
- Full name
- Email address
- Additional notes (optional)

They see a summary of their appointment before confirming.

### 6. Confirmation
After successful booking, users see:
- Appointment confirmation ID
- All appointment details
- Next steps and instructions
- Option to print or book another appointment

## Technical Details

### State Management
- React useState hooks for local state
- Form state managed in AppointmentForm component
- Appointment data passed to confirmation page via props

### API Communication
- Centralized API service in `/services/api.ts`
- All HTTP requests use native Fetch API
- Error handling with try-catch blocks
- Loading states for better UX

### Styling
- Tailwind CSS v4 for all styling
- Responsive design (mobile-first approach)
- Consistent color scheme (blue primary, gray neutrals)
- Lucide React for icons

### Form Validation
- HTML5 validation for required fields
- Email format validation
- Custom validation for date/time selection
- Server-side validation should be implemented in Spring Boot

## Stretch Goals

### Email Confirmation
The API service includes a method for sending email confirmations. Implement this endpoint in your Spring Boot backend:

```typescript
await apiService.sendEmailConfirmation(appointmentId);
```

### Branch Business Hours
Support for day-specific business hours (e.g., shorter Saturday hours). The API service includes:

```typescript
await apiService.getBranchHours(branchId, date);
```

See API_DOCUMENTATION.md for implementation details.

## Development Notes

### Error Handling
The application handles these error scenarios:
- Failed to load topics/branches/dates/slots
- Appointment creation failure
- Network errors

### Race Conditions
The backend must prevent double-booking using:
- Database unique constraints on (branch_id, date_time)
- Transaction isolation
- Row-level locking if necessary

### Date/Time Handling
- Dates are in `YYYY-MM-DD` format
- Times are in `HH:mm` format (24-hour)
- DateTime combined as ISO 8601: `YYYY-MM-DDTHH:mm:ss`
- All times should be in the branch's local timezone

## Testing Checklist

- [ ] Backend API endpoints are implemented
- [ ] CORS is configured correctly
- [ ] Sample data is loaded into database
- [ ] Topics load successfully
- [ ] Branches filter by topic correctly
- [ ] Available dates display properly
- [ ] Time slots show correct availability
- [ ] Appointments can be created
- [ ] Duplicate appointments are prevented
- [ ] Confirmation page displays correct information
- [ ] Email confirmation is sent (stretch goal)
- [ ] Branch hours vary by day of week (stretch goal)

## Support

For questions about:
- **Frontend implementation**: Review this README and component code
- **Backend API requirements**: See API_DOCUMENTATION.md
- **Database schema**: See API_DOCUMENTATION.md
- **CORS issues**: Check Spring Boot CORS configuration

## License

This is a student project for UCM Spring 2026.
