import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { AppointmentForm } from './components/AppointmentForm';
import { ConfirmationPage } from './components/ConfirmationPage';
import { AdminPage } from './components/AdminPage';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const handleLogin = (adminMode: boolean) => {
    setIsLoggedIn(true);
    setIsAdmin(adminMode);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setConfirmedAppointment(null);
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

  if (isAdmin) {
    return <AdminPage onLogout={handleLogout} />;
  }

  // Show appointment booking system after login
  return (
    <div className="min-h-screen bg-white">
      {!confirmedAppointment ? (
        <AppointmentForm
          onAppointmentBooked={handleAppointmentBooked}
          onLogout={handleLogout}
        />
      ) : (
        <ConfirmationPage 
          appointment={confirmedAppointment} 
          onBookAnother={handleBookAnother}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
