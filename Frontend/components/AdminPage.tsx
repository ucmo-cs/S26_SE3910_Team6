import { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';

interface AdminAppointment {
  id: string;
  name: string;
  email: string;
  topicId: string;
  branchId: string;
  dateTime: string;
  reason: string;
  createdAt?: string;
}

interface Topic {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
}

interface AdminPageProps {
  onLogout: () => void;
}

export function AdminPage({ onLogout }: AdminPageProps) {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const topicMap = useMemo(() => {
    const map = new Map<string, string>();
    topics.forEach((t) => map.set(t.id, t.name));
    return map;
  }, [topics]);

  const branchMap = useMemo(() => {
    const map = new Map<string, string>();
    branches.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [branches]);

  const loadReferenceData = async () => {
    const topicData = await apiService.getTopics();
    setTopics(topicData);

    const branchesByTopic = await Promise.all(
      topicData.map((topic) => apiService.getBranchesByTopic(topic.id))
    );

    const allBranchesMap = new Map<string, Branch>();
    branchesByTopic.flat().forEach((branch) => {
      if (!allBranchesMap.has(branch.id)) {
        allBranchesMap.set(branch.id, { id: branch.id, name: branch.name });
      }
    });

    setBranches(Array.from(allBranchesMap.values()));
  };

  const loadAppointments = async () => {
    const data = await apiService.getAllAppointments();
    setAppointments(data);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([loadReferenceData(), loadAppointments()]);
    } catch (err) {
      console.error(err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDelete = async (appointmentId: string) => {
    const confirmed = window.confirm('Delete this appointment? This cannot be undone.');
    if (!confirmed) return;

    try {
      setDeletingId(appointmentId);
      await apiService.deleteAppointment(appointmentId);
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete appointment. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = window.confirm('Delete ALL appointments? This cannot be undone.');
    if (!confirmed) return;

    try {
      setDeletingId('ALL');
      await apiService.deleteAllAppointments();
      setAppointments([]);
    } catch (err) {
      console.error(err);
      setError('Failed to delete appointments. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const d = new Date(dateTime);
    if (Number.isNaN(d.getTime())) return dateTime;
    return d.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="mb-1">Admin Appointments</h1>
            <p className="text-gray-600">View and delete all scheduled appointments</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              onClick={loadAll}
            >
              Refresh
            </button>
            <button
              type="button"
              className="px-4 py-2 text-white rounded-lg"
              style={{ backgroundColor: '#d14343' }}
              onClick={handleDeleteAll}
              disabled={appointments.length === 0 || deletingId === 'ALL'}
            >
              {deletingId === 'ALL' ? 'Deleting...' : 'Delete All'}
            </button>
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
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="text-gray-600">No appointments found.</div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-gray-700 text-sm">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date & Time</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Topic</th>
                    <th className="px-4 py-3 font-medium">Branch</th>
                    <th className="px-4 py-3 font-medium">Reason</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-t border-gray-200">
                      <td className="px-4 py-3 text-gray-800">
                        {formatDateTime(appointment.dateTime)}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{appointment.name}</td>
                      <td className="px-4 py-3 text-gray-800">{appointment.email}</td>
                      <td className="px-4 py-3 text-gray-800">
                        {topicMap.get(appointment.topicId) || appointment.topicId}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {branchMap.get(appointment.branchId) || appointment.branchId}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{appointment.reason || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="px-3 py-2 text-white rounded-lg"
                          style={{ backgroundColor: '#d14343' }}
                          onClick={() => handleDelete(appointment.id)}
                          disabled={deletingId === appointment.id}
                        >
                          {deletingId === appointment.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
