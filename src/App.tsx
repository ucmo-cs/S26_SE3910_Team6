import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { AppointmentForm } from './components/AppointmentForm';
import { ConfirmationPage } from './components/ConfirmationPage';

export interface Appointment {
  id?: string;
  name: string;
  email: string;
  topicId: string;
  topicName: string;
  branchId: string;
  branchName: string;
  branchAddress: string;
  dateTime: string;
  reason: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleAppointmentBooked = (appointment: Appointment) => {
    setConfirmedAppointment(appointment);
  };

  const handleBookAnother = () => {
    setConfirmedAppointment(null);
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show appointment booking system after login
  return (
    <div className="min-h-screen bg-white">
      {!confirmedAppointment ? (
        <AppointmentForm onAppointmentBooked={handleAppointmentBooked} />
      ) : (
        <ConfirmationPage 
          appointment={confirmedAppointment} 
          onBookAnother={handleBookAnother}
        />
      )}
    </div>
  );
}