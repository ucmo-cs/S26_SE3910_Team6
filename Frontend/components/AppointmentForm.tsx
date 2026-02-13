import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, FileText, User, Mail, CheckCircle } from 'lucide-react';
import { Appointment } from '../App';
import { apiService } from '../services/api';

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

interface AppointmentFormProps {
  onAppointmentBooked: (appointment: Appointment) => void;
  onLogout: () => void;
}

export function AppointmentForm({ onAppointmentBooked, onLogout }: AppointmentFormProps) {
  const [hoveredBranchId, setHoveredBranchId] = useState<string | null>(null);
  const [agentInput, setAgentInput] = useState('');
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [agentMode, setAgentMode] = useState<'idle' | 'guide'>('idle');
  const branchPinPositions: Record<string, { left: number; top: number }> = {
    'Downtown Main Branch': { left: 48, top: 52 },
    'Westside Branch': { left: 28, top: 46 },
    'Business District Branch': { left: 60, top: 44 },
    'Suburban Plaza Branch': { left: 68, top: 60 },
  };

  const fallbackPins = [
    { left: 22, top: 40 },
    { left: 40, top: 55 },
    { left: 58, top: 42 },
    { left: 72, top: 58 },
  ];
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');

  // Data from API
  const [topics, setTopics] = useState<Topic[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);

  // Load topics on mount
  useEffect(() => {
    loadTopics();
  }, []);

  // Load branches when topic is selected
  useEffect(() => {
    if (selectedTopic) {
      loadBranches(selectedTopic.id);
    }
  }, [selectedTopic]);

  // Load available dates when branch is selected
  useEffect(() => {
    if (selectedBranch) {
      loadAvailableDates(selectedBranch.id);
    }
  }, [selectedBranch]);

  // Load time slots when date is selected, and refetch when returning to step 4 (e.g. after booking)
  useEffect(() => {
    if (selectedBranch && selectedDate) {
      loadTimeSlots(selectedBranch.id, selectedDate);
    }
  }, [selectedBranch, selectedDate]);

  // Refetch time slots when user navigates back to step 4 from step 5 so newly booked slots show as unavailable
  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    const wasOnStep5 = prevStepRef.current === 5;
    prevStepRef.current = currentStep;
    if (wasOnStep5 && currentStep === 4 && selectedBranch && selectedDate) {
      loadTimeSlots(selectedBranch.id, selectedDate);
    }
  }, [currentStep, selectedBranch, selectedDate]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTopics();
      setTopics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load appointment topics. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async (topicId: string) => {
    try {
      setLoading(true);
      const data = await apiService.getBranchesByTopic(topicId);
      setBranches(data);
      setError(null);
    } catch (err) {
      setError('Failed to load branches. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTopicSuggestion = (input: string) => {
    const text = input.toLowerCase();
    if (text.includes('loan') || text.includes('borrow') || text.includes('rate') || text.includes('refinance')) {
      return 'Personal Loans';
    }
    if (text.includes('credit') || text.includes('card') || text.includes('limit') || text.includes('balance')) {
      return 'Credit Cards';
    }
    if (text.includes('mortgage') || text.includes('home') || text.includes('house')) {
      return 'Mortgage Services';
    }
    if (text.includes('invest') || text.includes('retire') || text.includes('portfolio') || text.includes('planning')) {
      return 'Investment Advisory';
    }
    if (text.includes('business') || text.includes('merchant') || text.includes('payroll') || text.includes('company')) {
      return 'Business Banking';
    }
    return null;
  };

  const handleAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = agentInput.trim().toLowerCase();
    if (!trimmed || trimmed.includes("not sure") || trimmed.includes("unsure") || trimmed.includes("dont know") || trimmed.includes("don't know")) {
      setAgentMode('guide');
      setAgentResponse('No worries! Pick the option that fits best:');
      return;
    }

    const suggestion = getTopicSuggestion(agentInput);
    if (suggestion) {
      setAgentResponse(`It sounds like “${suggestion}” is the best fit. Select that topic to continue.`);
      setAgentMode('idle');
    } else {
      setAgentMode('guide');
      setAgentResponse('I can help! Choose a description below, and I’ll point you to the right topic:');
    }
  };

  const handleAgentOption = (label: string, hint: string) => {
    setAgentInput(hint);
    const suggestion = getTopicSuggestion(hint);
    if (suggestion) {
      setAgentResponse(`That sounds like “${suggestion}”. Select it to continue.`);
      setAgentMode('idle');
    } else {
      setAgentResponse(`Thanks! Based on that, try: ${label}.`);
    }
  };

  const loadAvailableDates = async (branchId: string) => {
    try {
      setLoading(true);
      const data = await apiService.getAvailableDates(branchId);
      setAvailableDates(data);
      setError(null);
    } catch (err) {
      setError('Failed to load available dates. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async (branchId: string, date: string) => {
    try {
      setLoading(true);
      const data = await apiService.getAvailableTimeSlots(branchId, date);
      setAvailableTimeSlots(data);
      setError(null);
    } catch (err) {
      setError('Failed to load available time slots. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedBranch(null);
    setSelectedDate('');
    setSelectedTime('');
    setCurrentStep(2);
  };

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setSelectedDate('');
    setSelectedTime('');
    setCurrentStep(3);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setCurrentStep(4);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep(5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTopic || !selectedBranch || !selectedDate || !selectedTime) {
      setError('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const appointmentData = {
        name,
        email,
        topicId: selectedTopic.id,
        branchId: selectedBranch.id,
        dateTime: `${selectedDate}T${selectedTime}`,
        reason,
      };

      const response = await apiService.createAppointment(appointmentData);

      onAppointmentBooked({
        ...response,
        topicName: selectedTopic.name,
        branchName: selectedBranch.name,
        branchAddress: selectedBranch.address,
      });
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="mb-2">Book an Appointment</h1>
          <p className="text-gray-600">Schedule a visit with one of our representatives</p>
        </div>
        <button
          type="button"
          className="px-4 py-2 text-white rounded-lg"
          style={{ backgroundColor: '#016649' }}
          onClick={onLogout}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#014d37'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#016649'}
        >
          Log Out
        </button>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { num: 1, label: 'Topic' },
            { num: 2, label: 'Branch' },
            { num: 3, label: 'Date' },
            { num: 4, label: 'Time' },
            { num: 5, label: 'Details' },
          ].map((step, index) => (
            <div key={step.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors text-white"
                  style={{
                    backgroundColor: currentStep >= step.num ? '#016649' : '#e5e7eb',
                    color: currentStep >= step.num ? '#ffffff' : '#4b5563'
                  }}
                >
                  {currentStep > step.num ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.num
                  )}
                </div>
                <span className="text-xs mt-1 text-gray-600">{step.label}</span>
              </div>
              {index < 4 && (
                <div
                  className="h-1 flex-1 mx-2 transition-colors"
                  style={{
                    backgroundColor: currentStep > step.num ? '#016649' : '#e5e7eb',
                    marginTop: '-20px'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Select Topic */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: '#FFD100' }} />
            Select Appointment Topic
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading topics...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic)}
                  className="p-4 border-2 border-gray-200 rounded-lg text-left transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#74BE42';
                    e.currentTarget.style.backgroundColor = '#ffd10010';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <div className="font-medium mb-1">{topic.name}</div>
                  <div className="text-sm text-gray-600">{topic.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {currentStep === 1 && (
        <div
          className="fixed bottom-6 right-6 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
          style={{ zIndex: 50 }}
        >
          <div className="font-medium mb-1">Need help picking a topic?</div>
          <div className="text-sm text-gray-600 mb-3">
            Tell me what you’re looking to do and I’ll point you to the right option.
          </div>
          <form onSubmit={handleAgentSubmit} className="flex gap-2">
            <input
              type="text"
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g., open a credit card"
            />
            <button
              type="submit"
              className="px-3 py-2 text-sm text-white rounded-lg"
              style={{ backgroundColor: '#016649' }}
            >
              Ask
            </button>
          </form>
          {agentResponse && (
            <div className="mt-3 text-sm text-gray-700">
              {agentResponse}
            </div>
          )}
          {agentMode === 'guide' && (
            <div className="mt-3 grid gap-2 text-sm">
              <button
                type="button"
                className="text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                onClick={() => handleAgentOption('Personal Loans', 'I want to borrow money or discuss loan rates')}
              >
                Borrow money or loan rates
              </button>
              <button
                type="button"
                className="text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                onClick={() => handleAgentOption('Credit Cards', 'I want a new credit card or have a card question')}
              >
                Credit card help
              </button>
              <button
                type="button"
                className="text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                onClick={() => handleAgentOption('Mortgage Services', 'I need help with a home loan or mortgage')}
              >
                Home loan / mortgage
              </button>
              <button
                type="button"
                className="text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                onClick={() => handleAgentOption('Investment Advisory', 'I want investment or retirement advice')}
              >
                Investing / retirement
              </button>
              <button
                type="button"
                className="text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                onClick={() => handleAgentOption('Business Banking', 'I have a business and need banking services')}
              >
                Business banking
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Branch */}
      {currentStep === 2 && selectedTopic && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="mb-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="text-sm mb-2 hover:underline"
              style={{ color: '#FFD100' }}
            >
              ← Change Topic
            </button>
            <h2 className="flex items-center gap-2">
            <MapPin className="w-5 h-5" style={{ color: '#FFD100' }} />
              Select Branch Location
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing branches that support: {selectedTopic.name}
            </p>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading branches...</div>
          ) : branches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No branches available for this topic.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-full rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Fictional Branch Map</div>
                <div
                  className="w-full overflow-hidden rounded-lg border border-gray-200"
                  style={{ position: 'relative' }}
                >
                  <img
                    src="/kc-map2.jpg"
                    alt="City map"
                    className="w-full h-auto block align-top"
                  />
                  <div
                    style={{ position: 'absolute', inset: 0, zIndex: 2 }}
                  >
                    {branches.map((branch, index) => {
                      const position = branchPinPositions[branch.name] ?? fallbackPins[index % fallbackPins.length];
                      const isHovered = hoveredBranchId === branch.id;
                      return (
                        <div
                          key={`pin-${branch.id}`}
                          style={{
                            position: 'absolute',
                            left: `${position.left}%`,
                            top: `${position.top}%`,
                            transform: 'translate(-50%, -100%)',
                          }}
                          aria-hidden="true"
                          onMouseEnter={() => setHoveredBranchId(branch.id)}
                          onMouseLeave={() => setHoveredBranchId(null)}
                        >
                          <div style={{ position: 'relative' }}>
                            <svg width="24" height="32" viewBox="0 0 18 24" role="presentation">
                              <path
                                d="M9 1.5c-4 0-7.25 3.05-7.25 6.82 0 4.91 5.96 12.11 6.53 12.81.18.23.53.23.71 0 .57-.7 6.53-7.9 6.53-12.81C15.5 4.55 13.01 1.5 9 1.5z"
                                fill="#016649"
                                stroke="#ffffff"
                                strokeWidth="1.2"
                              />
                              <circle cx="9" cy="8.2" r="2.4" fill="#ffffff" />
                            </svg>
                            <div
                              className="pointer-events-none"
                              style={{
                                position: 'absolute',
                                left: '28px',
                                top: '2px',
                                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                                color: '#1f2937',
                                borderRadius: '8px',
                                padding: '6px 8px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                lineHeight: 1.2,
                                maxWidth: '220px',
                                opacity: isHovered ? 1 : 0,
                                transform: isHovered ? 'translateY(0)' : 'translateY(4px)',
                                transition: 'opacity 120ms ease, transform 120ms ease',
                              }}
                            >
                              <div style={{ fontSize: '12px', fontWeight: 600 }}>{branch.name}</div>
                              <div style={{ fontSize: '11px', color: '#4b5563' }}>{branch.address}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  className="p-4 border-2 border-gray-200 rounded-lg text-left transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#74BE42';
                    e.currentTarget.style.backgroundColor = '#ffd10010';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <div className="font-medium mb-1">{branch.name}</div>
                  <div className="text-sm text-gray-600">{branch.address}</div>
                  <div className="text-sm text-gray-500 mt-1">{branch.phone}</div>
                </button>
              ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Select Date */}
      {currentStep === 3 && selectedBranch && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="mb-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="text-sm mb-2 hover:underline"
              style={{ color: '#FFD100' }}
            >
              ← Change Branch
            </button>
            <h2 className="flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: '#FFD100' }} />
              Select Date
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedBranch.name}
            </p>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading available dates...</div>
          ) : availableDates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No dates available for this branch.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className="p-4 border-2 border-gray-200 rounded-lg transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#74BE42';
                    e.currentTarget.style.backgroundColor = '#ffd10010';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <div className="font-medium">{formatDate(date)}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Select Time */}
      {currentStep === 4 && selectedDate && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="mb-4">
            <button
              onClick={() => setCurrentStep(3)}
              className="text-sm mb-2 hover:underline"
              style={{ color: '#FFD100' }}
            >
              ← Change Date
            </button>
            <h2 className="flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: '#FFD100' }} />
              Select Time
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(selectedDate)} at {selectedBranch?.name}
            </p>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading available times...</div>
          ) : availableTimeSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No time slots for this date. Please select a different date.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-4">
              {availableTimeSlots.map((slot) => {
                const time = slot.dateTime.split('T')[1].substring(0, 5);
                const isAvailable = slot.available;
                return (
                  <button
                    key={slot.dateTime}
                    type="button"
                    onClick={() => isAvailable && handleTimeSelect(time)}
                    disabled={!isAvailable}
                    className={
                      isAvailable
                        ? 'p-3 border-2 border-gray-200 rounded-lg transition-colors cursor-pointer'
                        : 'p-3 border-2 border-gray-100 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed'
                    }
                    onMouseEnter={isAvailable ? (e) => {
                      e.currentTarget.style.borderColor = '#74BE42';
                      e.currentTarget.style.backgroundColor = '#ffd10010';
                    } : undefined}
                    onMouseLeave={isAvailable ? (e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = '';
                    } : undefined}
                  >
                    <div className={`font-medium ${!isAvailable ? 'line-through' : ''}`}>
                      {formatTime(time)}
                    </div>
                    {!isAvailable && (
                      <div className="text-xs mt-0.5 text-gray-400">Unavailable</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 5: Enter Details and Confirm */}
      {currentStep === 5 && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="mb-6">
            <User className="w-5 h-5 inline mr-2" style={{ color: '#FFD100' }} />
            Your Information
          </h2>

          {/* Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-3">Appointment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Topic:</span>
                <span className="font-medium">{selectedTopic?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Branch:</span>
                <span className="font-medium">{selectedBranch?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{formatTime(selectedTime)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="text-sm mt-3 hover:underline"
              style={{ color: '#FFD100' }}
            >
              ← Change Appointment
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#74BE42' } as React.CSSProperties}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#74BE42' } as React.CSSProperties}
                placeholder="john.doe@example.com"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#74BE42' } as React.CSSProperties}
                placeholder="Please provide any additional information about your appointment..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#016649' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#014d37')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#016649')}
            >
              {loading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
