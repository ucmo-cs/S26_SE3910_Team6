import { useState } from 'react';
import { AppointmentForm } from './components/AppointmentForm';
import { ConfirmationPage } from './components/ConfirmationPage';
import { AdminPage } from './components/AdminPage';
import { HomePage } from './components/HomePage';

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
  const [showHome, setShowHome] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const handleGetStarted = () => {
    setShowHome(false);
  };

  const handleLogin = (adminMode: boolean) => {
    setIsLoggedIn(true);
    setIsAdmin(adminMode);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setConfirmedAppointment(null);
    setShowHome(true);
  };

  const handleAppointmentBooked = (appointment: Appointment) => {
    setConfirmedAppointment(appointment);
  };

  const handleBookAnother = () => {
    setConfirmedAppointment(null);
  };

  if (showHome) {
    return <HomePage onGetStarted={handleGetStarted} />;
  }

  if (isAdmin) {
    return <AdminPage onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {!confirmedAppointment ? (
        <AppointmentForm
          onAppointmentBooked={handleAppointmentBooked}
          onLogout={handleLogout}
          onLogin={handleLogin}
          isLoggedIn={isLoggedIn}
          onBackHome={() => setShowHome(true)}
        />
      ) : (
        <ConfirmationPage 
          appointment={confirmedAppointment} 
          onBookAnother={handleBookAnother}
          onLogout={handleLogout}
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  );
}
