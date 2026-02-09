/**
 * API Service for Spring Boot Backend Integration
 * 
 * This service provides methods to communicate with the Spring Boot REST API.
 * Update the API_BASE_URL constant with your actual backend URL.
 * 
 * MOCK MODE: Set USE_MOCK_DATA to true to use mock data while developing the backend.
 * Set to false once your Spring Boot backend is running.
 * 
 * REQUIRED SPRING BOOT ENDPOINTS:
 * 
 * 1. GET /api/topics
 *    Returns: Array of Topic objects
 *    Example: [{ id: "1", name: "Loans", description: "Apply for personal or business loans" }]
 * 
 * 2. GET /api/branches?topicId={topicId}
 *    Returns: Array of Branch objects that support the given topic
 *    Example: [{ id: "1", name: "Main Street Branch", address: "123 Main St", phone: "(555) 123-4567", supportedTopicIds: ["1", "2"] }]
 * 
 * 3. GET /api/appointments/available-dates?branchId={branchId}
 *    Returns: Array of available date strings (ISO format YYYY-MM-DD)
 *    Example: ["2026-02-01", "2026-02-02", "2026-02-03"]
 * 
 * 4. GET /api/appointments/available-slots?branchId={branchId}&date={date}
 *    Returns: Array of TimeSlot objects for the given date
 *    Example: [{ dateTime: "2026-02-01T09:00:00", available: true }, { dateTime: "2026-02-01T09:30:00", available: false }]
 * 
 * 5. POST /api/appointments
 *    Request Body: { name: string, email: string, topicId: string, branchId: string, dateTime: string (ISO 8601), reason: string }
 *    Returns: Created appointment with id
 *    Example: { id: "123", name: "John Doe", email: "john@example.com", ... }
 * 
 * STRETCH GOAL ENDPOINTS:
 * 
 * 6. POST /api/appointments/{id}/send-confirmation
 *    Sends email confirmation for the appointment
 * 
 * 7. GET /api/branches/{branchId}/hours?date={date}
 *    Returns business hours for a specific branch and day
 *    Example: { openTime: "09:00", closeTime: "17:00" }
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Set to true to use mock data (for frontend development without backend)
// Set to false to connect to your backend
const USE_MOCK_DATA = false;

// Configure your backend URL here
const API_BASE_URL = 'http://localhost:3001/api';


// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TOPICS: Topic[] = [
  {
    id: '1',
    name: 'Personal Loans',
    description: 'Apply for personal loans, discuss rates and terms'
  },
  {
    id: '2',
    name: 'Credit Cards',
    description: 'Apply for credit cards or discuss existing accounts'
  },
  {
    id: '3',
    name: 'Business Banking',
    description: 'Open business accounts, loans, and merchant services'
  },
  {
    id: '4',
    name: 'Mortgage Services',
    description: 'Home loans, refinancing, and mortgage consultations'
  },
  {
    id: '5',
    name: 'Investment Advisory',
    description: 'Financial planning and investment consultation'
  }
];

const MOCK_BRANCHES: Branch[] = [
  {
    id: '1',
    name: 'Downtown Main Branch',
    address: '123 Main Street, Suite 100, Downtown, CA 90001',
    phone: '(555) 123-4567',
    supportedTopicIds: ['1', '2', '3', '4', '5']
  },
  {
    id: '2',
    name: 'Westside Branch',
    address: '456 West Avenue, Westside, CA 90002',
    phone: '(555) 234-5678',
    supportedTopicIds: ['1', '2', '4']
  },
  {
    id: '3',
    name: 'Business District Branch',
    address: '789 Commerce Blvd, Business District, CA 90003',
    phone: '(555) 345-6789',
    supportedTopicIds: ['2', '3', '5']
  },
  {
    id: '4',
    name: 'Suburban Plaza Branch',
    address: '321 Plaza Drive, Suburban, CA 90004',
    phone: '(555) 456-7890',
    supportedTopicIds: ['1', '2', '4']
  }
];

// Store booked appointments in memory (for mock mode)
const bookedAppointments: Set<string> = new Set();
const mockAppointments: AppointmentResponse[] = [];

// ============================================================================
// INTERFACES
// ============================================================================

interface Topic {
  id: string;
  name: string;
  description: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  supportedTopicIds: string[];
}

interface TimeSlot {
  dateTime: string;
  available: boolean;
}

interface CreateAppointmentRequest {
  name: string;
  email: string;
  topicId: string;
  branchId: string;
  dateTime: string;
  reason: string;
}

interface AppointmentResponse {
  id: string;
  name: string;
  email: string;
  topicId: string;
  branchId: string;
  dateTime: string;
  reason: string;
  createdAt?: string;
}

class ApiService {
  private baseUrl: string;
  private useMock: boolean;

  constructor(baseUrl: string, useMock: boolean) {
    this.baseUrl = baseUrl;
    this.useMock = useMock;
  }

  /**
   * Simulates network delay for more realistic mock behavior
   */
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET /api/topics
   * Retrieves all available appointment topics
   */
  async getTopics(): Promise<Topic[]> {
    if (this.useMock) {
      await this.delay();
      return MOCK_TOPICS;
    }

    const response = await fetch(`${this.baseUrl}/topics`);
    if (!response.ok) {
      throw new Error('Failed to fetch topics');
    }
    return response.json();
  }

  /**
   * GET /api/branches?topicId={topicId}
   * Retrieves branches that support a specific topic
   */
  async getBranchesByTopic(topicId: string): Promise<Branch[]> {
    if (this.useMock) {
      await this.delay();
      return MOCK_BRANCHES.filter(branch => 
        branch.supportedTopicIds.includes(topicId)
      );
    }

    const response = await fetch(`${this.baseUrl}/branches?topicId=${topicId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch branches');
    }
    return response.json();
  }

  /**
   * GET /api/appointments/available-dates?branchId={branchId}
   * Retrieves available dates for a specific branch
   * Returns dates in YYYY-MM-DD format
   */
  async getAvailableDates(branchId: string): Promise<string[]> {
    if (this.useMock) {
      await this.delay();
      // Generate next 14 days of available dates
      const dates: string[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Skip Sundays (day 0)
        if (date.getDay() !== 0) {
          const dateString = date.toISOString().split('T')[0];
          dates.push(dateString);
        }
      }
      
      return dates;
    }

    const response = await fetch(
      `${this.baseUrl}/appointments/available-dates?branchId=${branchId}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch available dates');
    }
    return response.json();
  }

  /**
   * GET /api/appointments/available-slots?branchId={branchId}&date={date}
   * Retrieves available time slots for a specific branch and date
   * Date should be in YYYY-MM-DD format
   * Returns slots with dateTime in ISO 8601 format
   */
  async getAvailableTimeSlots(branchId: string, date: string): Promise<TimeSlot[]> {
    if (this.useMock) {
      await this.delay();
      
      const slots: TimeSlot[] = [];
      const dateObj = new Date(date + 'T00:00:00');
      const dayOfWeek = dateObj.getDay();
      const isSaturday = dayOfWeek === 6;
      
      // Business hours
      const startHour = 9;
      const endHour = isSaturday ? 13 : 17; // Saturdays close at 1 PM
      const lunchStart = 12;
      const lunchEnd = 13;
      
      for (let hour = startHour; hour < endHour; hour++) {
        // Skip lunch break on weekdays
        if (!isSaturday && hour >= lunchStart && hour < lunchEnd) {
          continue;
        }
        
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
          const dateTimeString = `${date}T${timeString}`;
          const slotKey = `${branchId}-${dateTimeString}`;
          
          // Randomly mark some slots as unavailable (already booked)
          const isBooked = bookedAppointments.has(slotKey) || Math.random() < 0.15;
          
          slots.push({
            dateTime: dateTimeString,
            available: !isBooked
          });
        }
      }
      
      return slots;
    }

    const response = await fetch(
      `${this.baseUrl}/appointments/available-slots?branchId=${branchId}&date=${date}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch available time slots');
    }
    return response.json();
  }

  /**
   * POST /api/appointments
   * Creates a new appointment
   * The dateTime should be in ISO 8601 format (e.g., "2026-02-01T09:00:00")
   */
  async createAppointment(appointment: CreateAppointmentRequest): Promise<AppointmentResponse> {
    if (this.useMock) {
      await this.delay(500);
      
      // Mark this slot as booked
      const slotKey = `${appointment.branchId}-${appointment.dateTime}`;
      bookedAppointments.add(slotKey);
      
      // Generate a mock appointment ID
      const id = `APT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const createdAt = new Date().toISOString();

      const created = {
        id,
        ...appointment,
        createdAt,
      };

      mockAppointments.unshift(created);
      
      return created;
    }

    const response = await fetch(`${this.baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    });
    if (!response.ok) {
      throw new Error('Failed to create appointment');
    }
    return response.json();
  }

  /**
   * GET /api/appointments
   * Retrieves all appointments (admin)
   */
  async getAllAppointments(): Promise<AppointmentResponse[]> {
    if (this.useMock) {
      await this.delay();
      return [...mockAppointments];
    }

    const response = await fetch(`${this.baseUrl}/appointments`);
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }
    return response.json();
  }

  /**
   * DELETE /api/appointments/{id}
   * Deletes an appointment (admin)
   */
  async deleteAppointment(appointmentId: string): Promise<void> {
    if (this.useMock) {
      await this.delay();
      const index = mockAppointments.findIndex((apt) => apt.id === appointmentId);
      if (index >= 0) {
        mockAppointments.splice(index, 1);
      }
      return;
    }

    const response = await fetch(`${this.baseUrl}/appointments/${appointmentId}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to delete appointment');
    }
  }

  /**
   * DELETE /api/appointments
   * Deletes all appointments (admin)
   */
  async deleteAllAppointments(): Promise<void> {
    if (this.useMock) {
      await this.delay();
      mockAppointments.splice(0, mockAppointments.length);
      return;
    }

    const response = await fetch(`${this.baseUrl}/appointments`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete appointments');
    }
  }

  /**
   * STRETCH GOAL: Send email confirmation
   * POST /api/appointments/{id}/send-confirmation
   */
  async sendEmailConfirmation(appointmentId: string): Promise<void> {
    if (this.useMock) {
      await this.delay();
      console.log(`Mock: Email confirmation sent for appointment ${appointmentId}`);
      return;
    }

    const response = await fetch(
      `${this.baseUrl}/appointments/${appointmentId}/send-confirmation`,
      {
        method: 'POST',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to send email confirmation');
    }
  }

  /**
   * STRETCH GOAL: Get branch hours for a specific date
   * GET /api/branches/{branchId}/hours?date={date}
   */
  async getBranchHours(branchId: string, date: string): Promise<{ openTime: string; closeTime: string }> {
    if (this.useMock) {
      await this.delay();
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const isSaturday = dayOfWeek === 6;
      
      return {
        openTime: '09:00',
        closeTime: isSaturday ? '13:00' : '17:00'
      };
    }

    const response = await fetch(
      `${this.baseUrl}/branches/${branchId}/hours?date=${date}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch branch hours');
    }
    return response.json();
  }
}

export const apiService = new ApiService(API_BASE_URL, USE_MOCK_DATA);
