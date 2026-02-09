import { CheckCircle, Calendar, MapPin, Clock, Mail, User, FileText } from 'lucide-react';
import { Appointment } from '../App';

interface ConfirmationPageProps {
  appointment: Appointment;
  onBookAnother: () => void;
  onLogout: () => void;
}

export function ConfirmationPage({ appointment, onBookAnother, onLogout }: ConfirmationPageProps) {
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const { date, time } = formatDateTime(appointment.dateTime);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-end mb-4">
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
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="mb-2">Appointment Confirmed!</h1>
          <p className="text-gray-600">
            Your appointment has been successfully booked. A confirmation email has been sent to {appointment.email}.
          </p>
        </div>

        {/* Confirmation Details */}
        <div className="border-t border-b border-gray-200 py-6 my-6 space-y-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#FFD100' }} />
            <div>
              <div className="text-sm text-gray-600">Name</div>
              <div className="font-medium">{appointment.name}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#FFD100' }} />
            <div>
              <div className="text-sm text-gray-600">Email</div>
              <div className="font-medium">{appointment.email}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#FFD100' }} />
            <div>
              <div className="text-sm text-gray-600">Topic</div>
              <div className="font-medium">{appointment.topicName}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#FFD100' }} />
            <div>
              <div className="text-sm text-gray-600">Branch Location</div>
              <div className="font-medium">{appointment.branchName}</div>
              <div className="text-sm text-gray-500">{appointment.branchAddress}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#FFD100' }} />
            <div>
              <div className="text-sm text-gray-600">Date</div>
              <div className="font-medium">{date}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#FFD100' }} />
            <div>
              <div className="text-sm text-gray-600">Time</div>
              <div className="font-medium">{time}</div>
              <div className="text-sm text-gray-500">30-minute appointment</div>
            </div>
          </div>

          {appointment.reason && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#FFD100' }} />
              <div>
                <div className="text-sm text-gray-600">Additional Notes</div>
                <div className="font-medium">{appointment.reason}</div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation ID */}
        {appointment.id && (
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-1">Confirmation ID</div>
            <div className="font-mono text-sm bg-gray-100 px-3 py-2 rounded border border-gray-300">
              {appointment.id}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="rounded-lg p-4 mb-6 border" style={{ backgroundColor: '#ffd10015', borderColor: '#ffd100' }}>
          <h3 className="font-medium mb-2">What's Next?</h3>
          <ul className="text-sm space-y-1" style={{ color: '#016649' }}>
            <li>• Check your email for the appointment confirmation</li>
            <li>• Arrive 5-10 minutes early to your appointment</li>
            <li>• Bring a valid ID and any relevant documents</li>
            <li>• If you need to cancel or reschedule, contact the branch directly</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onBookAnother}
            className="flex-1 px-6 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#016649' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#014d37'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#016649'}
          >
            Book Another Appointment
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
